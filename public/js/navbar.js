document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    
    // Función para manejar el scroll
    function handleScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // Agregar el evento de scroll
    window.addEventListener('scroll', handleScroll);

    // Llamar a la función una vez al cargar para establecer el estado inicial
    handleScroll();
}); 