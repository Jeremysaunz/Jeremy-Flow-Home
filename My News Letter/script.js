document.addEventListener('DOMContentLoaded', () => {
    // Scroll Animation Observer section
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-on-scroll');
    fadeElements.forEach(el => observer.observe(el));

    // Form Handling
    const form = document.getElementById('subscribeForm');
    const emailInput = document.getElementById('email');
    const submitBtn = form.querySelector('button');
    const originalBtnText = submitBtn.innerHTML;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = emailInput.value;
        if (!email) return;

        // Simulate API call
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 구독 처리중...';

        // Simulate delay for effect
        setTimeout(() => {
            submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> 구독 완료!';
            submitBtn.style.background = '#10B981'; // Success green color
            emailInput.value = '';

            // Show toast or alert
            showToast(`환영합니다! ${email}로 구독 확인 메일을 보냈습니다.`);

            // Reset button after 3 seconds
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                submitBtn.style.background = '';
            }, 3000);
        }, 1500);
    });

    // Header Scroll Effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
});

// Simple Toast Notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;

    // Toast Styles
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%) translateY(100px)',
        background: 'rgba(255, 255, 255, 0.9)',
        color: '#0f1115',
        padding: '12px 24px',
        borderRadius: '50px',
        fontWeight: '600',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        zIndex: '1000',
        transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    });

    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    // Remove toast
    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(100px)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 400);
    }, 4000);
}
