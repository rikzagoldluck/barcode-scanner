$('#problem').on('change', function () {
  var selected_option_value = $(this).find(':selected').val();
  setCookie('prob', selected_option_value, 1);
  window.location.href = '/scanner/scanner.html';
});
