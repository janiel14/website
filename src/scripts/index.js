const $email = document.querySelector('.links__button--email');
$email.addEventListener('click', _ => {
   const at = () => { return '@' };
   window.location.href='mailto:thalleshmmaia' + at + 'gmail.com'; 
});