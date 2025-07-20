(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

$(document).ready(function() {
  // Fetch countries data
  $.ajax({
      // Corrected URL to use the v3.1 endpoint
      url: 'https://restcountries.com/v3.1/all', 
      dataType: 'json',
      success: function(data) {
          var countryOptions = $('#countryOptions');
          // Loop through the data and append options to the dropdown menu
          data.forEach(function(country) {
              // Corrected: Access the common name from the new API structure (v3.1)
              countryOptions.append(`<button class="dropdown-item" type="button" data-value="${country.name.common}">${country.name.common}</button>`);
          });

          // Handle click on dropdown item
          $('.dropdown-item').on('click', function() {
              var selectedCountry = $(this).data('value');
              $('#countryDropdown').html(selectedCountry);
              $('#country').val(selectedCountry);
          });
      },
      // Added error handling for the AJAX call
      error: function(jqXHR, textStatus, errorThrown) {
          console.error("Failed to fetch countries: " + textStatus, errorThrown);
          // You might want to display a user-friendly message on the page here
      }
  });
});


document.addEventListener("DOMContentLoaded", function () {
  const taxSwitch = document.getElementById("flexSwitchCheckDefault");
  const allPrices = document.querySelectorAll('.card-text');

  taxSwitch.addEventListener("change", function () {
      const displayTax = this.checked; // Check if tax should be displayed
      for (let i = 0; i < allPrices.length; i++) {
          const originalPrice = parseFloat(allPrices[i].getAttribute('data-original-price'));
          if (!isNaN(originalPrice)) {
              const updatedPrice = displayTax ? (originalPrice * 1.18) : originalPrice;
              allPrices[i].innerHTML = `Price: &#x20b9 ${updatedPrice.toLocaleString('en-IN')}${displayTax ? `<i class="tax-info"> &nbsp;+18% GST</i>` : ''}`;
          }
      }
  });
});