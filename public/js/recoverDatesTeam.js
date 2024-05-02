document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('teamname').value;
    const description = document.getElementById('description').value;


    try {
        const response = await fetch('/newteam', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description })
        });

        const data = await response.json();

        if (data.redirect){
        window.location.href = data.redirect;
        }

        if (data.success) {
        document.getElementById("alert").className = "correct";
        document.getElementById("alert").innerText = "Registro exitoso";
        } else {
        document.getElementById("alert").className = "error";
        document.getElementById("alert").innerText = data.message || 'Error en el registro';
        return;
        }
    } catch (error) {
        console.error('Error al registrar:', error);
        document.getElementById("alert").className = "error";
        document.getElementById("alert").innerText = "Error al registrar, por favor intenta de nuevo";
    }
    });
});