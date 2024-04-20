document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
  
      try {
        const response = await fetch('/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({email, password }),
        });
  
        const data = await response.json();
  
        if (!data.success) {
          //alert(data.message || 'Error en el registro');
          document.getElementById("alert").className = "error";
          document.getElementById("alert").innerText = data.message || 'Error al iniciar sesion'
          return
        } 
      } catch (error) {
        console.error('Error al registrar:', error);
        //alert('Error al registrar, por favor intenta de nuevo');
        document.getElementById("alert").className = "error";
        document.getElementById("alert").innerText = "Error al iniciar sesion, por favor intenta de nuevo"
      }
    });
  });
  