document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const tackName = document.getElementById('tackname').value;
        const racecondition = document.getElementById('racecondition').value;
        const raceDuration = document.getElementById('raceduration').value;
        const dateStart = document.getElementById('datestart').value;
        const torneoID = document.getElementById('torneoid').textContent;

        try {
            const response = await fetch('/tournament/newtournament/addrace', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ torneoID, tackName, raceDuration, racecondition, dateStart })
            });

            const data = await response.json();

            if (data.redirect){
                window.location.href = data.redirect;
            }

            if (data.success) {
                document.getElementById("alert").className = "correct";
                document.getElementById("alert").innerText = "Registro exitoso";
                
                document.getElementById('tackname').value = '';
                document.getElementById('racecondition').value = '';
                document.getElementById('raceduration').value = '';
                document.getElementById('datestart').value = '';
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
