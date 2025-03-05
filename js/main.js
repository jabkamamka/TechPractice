document.addEventListener('DOMContentLoaded', () => {
    // Анимация при скролле
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.ideas-container > *').forEach(element => {
        observer.observe(element);
    });

    // Функция для плавной прокрутки
    function scrollToSection(targetElement) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    // Получаем элементы навигации
    const navigationLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const mobileMenu = document.querySelector('.nav-links');
    const menuToggle = document.querySelector('.menu-toggle');
    const ctaButton = document.querySelector('.cta-button');

    // Обработчик для навигационных ссылок
    navigationLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                scrollToSection(targetSection);
                navigationLinks.forEach(link => link.classList.remove('active'));
                this.classList.add('active');

                // Закрываем мобильное меню при клике
                if (mobileMenu && menuToggle) {
                    mobileMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
            }
        });
    });

    // Обработчик для кнопки "Начать сейчас"
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            const ideasSection = document.getElementById('ideas');
            if (ideasSection) {
                scrollToSection(ideasSection);
            }
        });
    }

    // Обновление активной ссылки при скролле
    function updateActiveLink() {
        const fromTop = window.scrollY + 100;

        navigationLinks.forEach(link => {
            const section = document.querySelector(link.hash);
            if (section && section.offsetTop <= fromTop &&
                section.offsetTop + section.offsetHeight > fromTop) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink();

    // Мобильное меню
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }

    // Предотвращаем скролл при открытом меню
    document.body.addEventListener('touchmove', (e) => {
        if (document.body.classList.contains('menu-open')) {
            e.preventDefault();
        }
    }, { passive: false });
}); 