document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
  
      if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
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
  
        if (data.success) {
          //alert('Registro exitoso');
          document.getElementById("alert").className = "correct";
          document.getElementById("alert").innerText = "Registro exitoso"
          // Aqui puedes redirigir al usuario a otra página o realizar otras acciones
        } else {
          //alert(data.message || 'Error en el registro');
          document.getElementById("alert").className = "error";
          document.getElementById("alert").innerText = data.message || 'Error en el registro'
          return
        }
      } catch (error) {
        console.error('Error al registrar:', error);
        //alert('Error al registrar, por favor intenta de nuevo');
        document.getElementById("alert").className = "error";
        document.getElementById("alert").innerText = "Error al registrar, por favor intenta de nuevo"
      }
    });
  });
  