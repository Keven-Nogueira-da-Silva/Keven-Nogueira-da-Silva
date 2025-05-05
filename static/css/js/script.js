document.getElementById('openReservationBtn').addEventListener('click', function() {
    window.location.href = 'home.html';
});

    
    // Close modal when clicking outside
    [reservationModal, successModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    // Form submission
    reservationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(reservationForm);
        const data = Object.fromEntries(formData.entries());
        
        try {
            // Show success modal
            reservationModal.classList.remove('active');
            successModal.classList.add('active');
            
            // Reset form
            reservationForm.reset();
            
            // In a real application, you would send this data to your server
            console.log('Reservation data:', data);
            
        } catch (error) {
            console.error('Error:', error);
            alert('Ocorreu um erro ao enviar sua reserva. Por favor, tente novamente.');
        }
    });
    
    // Toggle sublists
    function toggleLista(idLista, idSeta) {
        const lista = document.getElementById(idLista);
        const seta = document.getElementById(idSeta);
        
        lista.classList.toggle('aberto');
        seta.classList.toggle('seta-abaixada');
    }
    
    // Image zoom
    function zoomImage(img) {
        // Close any already zoomed image
        const zoomed = document.querySelector('.zoomed');
        if (zoomed) {
            zoomed.classList.remove('zoomed');
        }
        
        // Zoom the clicked image
        img.classList.toggle('zoomed');
        
        // Close zoom when clicking outside
        if (img.classList.contains('zoomed')) {
            img.addEventListener('click', function handler(e) {
                if (e.target === img) {
                    img.classList.remove('zoomed');
                    img.removeEventListener('click', handler);
                }
            });
        }
    }
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').min = today;
