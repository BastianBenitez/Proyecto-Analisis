document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
  
      if (password !== confirmPassword) {
        document.getElementById("alert").className = "error";
        document.getElementById("alert").innerText = "Las contraseñas no coinciden"
        
        return;
      }
  
      try {
        const response = await fetch('/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, email, password }),
        });
  
        const data = await response.json();

        if (data.redirect){
          window.location.href = data.redirect;
          console.log('hola')
        }
  
        if (data.success) {
          document.getElementById("alert").className = "correct";
          document.getElementById("alert").innerText = "Registro exitoso"
        } else {
          document.getElementById("alert").className = "error";
          document.getElementById("alert").innerText = data.message || 'Error en el registro'
          return
        }
      } catch (error) {
        console.error('Error al registrar:', error);
        document.getElementById("alert").className = "error";
        document.getElementById("alert").innerText = "Error al registrar, por favor intenta de nuevo"
      }
    });
  });
  