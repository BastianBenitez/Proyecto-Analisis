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
          body: JSON.stringify({ email, password })
        });
  
        const data = await response.json();
  
        if (!data.success) {
          document.getElementById("alert").className = "error";
          document.getElementById("alert").innerText = data.message || 'Error al iniciar sesion';
        }else{
          document.getElementById("alert").className = "correct";
          document.getElementById("alert").innerText = data.message;
          return;
        }
      } catch (error) {
        console.error('Error al registrar:', error);
        document.getElementById("alert").className = "error";
        document.getElementById("alert").innerText = "Error al iniciar sesion, por favor intenta de nuevo";
      }
    });
  });
  