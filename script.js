document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Lógica do Preview em Hover
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        const video = card.querySelector('.thumb-video');
        
        card.addEventListener('mouseenter', () => {
            if (video) {
                video.currentTime = 0; // Começa do início
                video.play();
            }
        });

        card.addEventListener('mouseleave', () => {
            if (video) {
                video.pause();
            }
        });
    });
});

// =======================================================
    // 2. LÓGICA DE INTRODUÇÃO E SCROLL (Apenas para o index.html)
    // =======================================================
    const introVideo = document.getElementById('intro-video');
    const worksSection = document.getElementById('works');
    const worksLink = document.querySelector('a[href="#works"]'); 
    
    if (introVideo && worksSection) {
        
        let isFirstVideoPlayed = false;
        let isForcedScrolling = false;

        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        function goToWorks() {
            if (isFirstVideoPlayed) return;

            document.body.style.overflow = ''; 
            isForcedScrolling = true;
            
            worksSection.scrollIntoView({ behavior: 'smooth' });
            
            setTimeout(() => {
                isForcedScrolling = false;
                isFirstVideoPlayed = true; 
            }, 1000);
        }

        // VERIFICAÇÃO: Se vieres de 'about.html#works', salta o vídeo
        if (window.location.hash === '#works') {
            isFirstVideoPlayed = true;
            document.body.style.overflow = '';
            // Dá um pequeno delay para garantir que o DOM está pronto
            setTimeout(() => {
                worksSection.scrollIntoView({ behavior: 'auto' });
            }, 100);
        } else {
            // COMPORTAMENTO PADRÃO:
            window.scrollTo(0, 0);
            document.body.style.overflow = 'hidden';
            
            // O vídeo controla o scroll quando acaba
            introVideo.addEventListener('ended', goToWorks);
        }

        // Caso o utilizador clique manualmente no link "Works"
        if (worksLink) {
            worksLink.addEventListener('click', (e) => {
                // Se o vídeo ainda não acabou, deixa o vídeo acabar o processo ou força-o
                if (!isFirstVideoPlayed) {
                    goToWorks(); 
                } else {
                    worksSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        // Armadilha para quando o utilizador faz scroll para cima
        window.addEventListener('scroll', () => {
            if (isForcedScrolling || !isFirstVideoPlayed) return;

            if (window.scrollY < window.innerHeight * 0.8) {
                // Ao subir, removemos o hash e recarregamos para resetar a experiência
                history.pushState("", document.title, window.location.pathname);
                window.location.reload();
            }
        });
    }

 // =======================================================
// 3. LÓGICA DO MODAL (ABRIR E FECHAR PROJETOS) - COM CARROSSEL
// =======================================================
let currentMediaList = [];
let currentMediaIndex = 0;

function openProject(media, title, year, desc) {
    const modal = document.getElementById('project-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalYear = document.getElementById('modal-year');
    const modalDesc = document.getElementById('modal-desc');

    currentMediaList = Array.isArray(media) ? media : [media];
    currentMediaIndex = 0;

    modalTitle.innerText = title;
    modalYear.innerText = year;
    // ↓ MUDA ESTA LINHA DE innerText PARA innerHTML ↓
    modalDesc.innerHTML = desc;

    renderMedia(currentMediaIndex);
    modal.style.display = 'block';
}
function renderMedia(index) {
    const container = document.getElementById('modal-media-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    // Faz o loop das setas
    if (index < 0) currentMediaIndex = currentMediaList.length - 1;
    else if (index >= currentMediaList.length) currentMediaIndex = 0;
    else currentMediaIndex = index;

    const currentSrc = currentMediaList[currentMediaIndex];
    const isVideo = currentSrc.match(/\.(mp4|webm|ogg|mov)$/i);

    // Injeta a foto ou vídeo sem estragar as proporções
    if (isVideo) {
        container.innerHTML = `<video id="full-video" src="${currentSrc}" controls autoplay playsinline style="height: 100vh; width: auto; max-width: 65vw; object-fit: contain;"></video>`;
    } else {
        container.innerHTML = `<img id="full-image" src="${currentSrc}" alt="Project Media" style="height: 100vh; width: auto; max-width: 65vw; object-fit: contain;">`;
    }

    // Se só houver 1 ficheiro, esconde as setas. Se houver 2 ou mais, mostra.
    if (currentMediaList.length > 1) {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
    } else {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    }
}

function changeMedia(direction) {
    renderMedia(currentMediaIndex + direction);
}

function closeProject() {
    const modal = document.getElementById('project-modal');
    const container = document.getElementById('modal-media-container');

    modal.style.display = 'none';
    container.innerHTML = ''; // Limpa o container para parar o som do vídeo
}

// Permitir usar as setas do teclado para navegar no carrossel, e o ESC para fechar
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('project-modal');
    if (modal && modal.style.display === 'block') {
        if (e.key === 'ArrowLeft' && currentMediaList.length > 1) changeMedia(-1);
        if (e.key === 'ArrowRight' && currentMediaList.length > 1) changeMedia(1);
        if (e.key === 'Escape') closeProject();
    }
});

// =======================================================
// 4. LÓGICA DO CURSOR CUSTOMIZADO ("VIEW MORE")
// =======================================================
const customCursor = document.getElementById('custom-cursor');
const allProjectCards = document.querySelectorAll('.project-card');

// Fazer o cursor seguir o movimento do rato no ecrã inteiro
document.addEventListener('mousemove', (e) => {
    if (customCursor) {
        customCursor.style.left = e.clientX + 'px';
        customCursor.style.top = e.clientY + 'px';
    }
});

// Detetar quando o rato entra e sai dos cartões de projeto
allProjectCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        if (customCursor) customCursor.classList.add('active');
    });

    card.addEventListener('mouseleave', () => {
        if (customCursor) customCursor.classList.remove('active');
    });
});

// =======================================================
// 5. EFEITO ESCADARIA NOS PROJETOS (WORKS)
// =======================================================
function updateStaircase() {
    const worksCards = document.querySelectorAll('.project-card');
    const windowHeight = window.innerHeight;
    const isMobile = window.innerWidth <= 768; 
    
    worksCards.forEach((card, index) => {
        // Nos telemóveis a grelha vira 1 coluna, logo não precisamos da escadaria
        if (isMobile) {
            card.style.setProperty('--scroll-offset', '0px');
            return;
        }

        const rect = card.getBoundingClientRect();
        
        // Calcula a percentagem visível (0 = no fundo do ecrã, 1 = alinhado perto do topo)
        let progress = (windowHeight - rect.top) / (windowHeight * 0.7);
        progress = Math.max(0, Math.min(1, progress));
        
        // Descobre em que linha e coluna o projeto está (assumindo 3 colunas por linha)
        const rowIndex = Math.floor(index / 3);
        const colIndex = index % 3;
        
        let multiplier;
        if (rowIndex % 2 === 0) {
            // Linhas pares (0, 2, 4...): Esquerda para a Direita -> multiplicador (0, 1, 2)
            multiplier = colIndex;
        } else {
            // Linhas ímpares (1, 3, 5...): Direita para a Esquerda -> multiplicador (2, 1, 0)
            multiplier = 2 - colIndex;
        }
        
        // Aplica o multiplicador ao valor do desnível (podes ajustar os 180px)
        const maxOffset = multiplier * 180;
        
        // Quanto mais fazes scroll, mais o offset caminha para 0 (alinhamento perfeito)
        const currentOffset = maxOffset * (1 - progress);
        
        // Injeta o valor final na variável CSS daquele cartão específico
        card.style.setProperty('--scroll-offset', `${currentOffset}px`);
    });
}

// Escuta os movimentos para animar
window.addEventListener('scroll', updateStaircase);
window.addEventListener('resize', updateStaircase);

// Inicia o cálculo quando o DOM está pronto (para cobrir os cartões visíveis no arranque)
document.addEventListener('DOMContentLoaded', updateStaircase);

// =======================================================
// 6. EFEITO DE RASTO DE IMAGENS (APENAS NA PÁGINA ABOUT)
// =======================================================
const isAboutPage = document.querySelector('.about-section') !== null;

if (isAboutPage) {
    // 1. Substitui estes caminhos pelas fotos reais que queres usar!
    const trailImages = [
        'assets/mouse1.jpeg',
        'assets/mouse2.png',
        'assets/mouse3.jpeg',
        'assets/mouse4.jpeg',
        'assets/mouse5.jpeg',
        'assets/mouse6.jpeg',
        'assets/mouse7.jpeg',
        'assets/mouse8.png',
    ];

    let imageIndex = 0;
    let lastMousePos = { x: 0, y: 0 };
    const threshold = 120; // Distância (em pixels) que tens de mover o rato para aparecer nova foto
    let activeImages = []; // Guarda um máximo de 4 fotos

    document.addEventListener('mousemove', (e) => {
        const currentPos = { x: e.clientX, y: e.clientY };
        
        // Pitágoras para calcular a distância do rato desde a última foto
        const dx = currentPos.x - lastMousePos.x;
        const dy = currentPos.y - lastMousePos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Se moveu o rato o suficiente, cria a próxima foto
        if (distance > threshold) {
            lastMousePos = currentPos;
            spawnImage(currentPos.x, currentPos.y);
        }
    });

    function spawnImage(x, y) {
        // Cria o elemento da imagem
        const img = document.createElement('img');
        img.src = trailImages[imageIndex];
        img.className = 'trail-image';
        
        // Centra no rato
        img.style.left = x + 'px';
        img.style.top = y + 'px';

        document.body.appendChild(img);
        activeImages.push(img);

        // Avança para a próxima foto no array (e volta ao início se chegar ao fim)
        imageIndex = (imageIndex + 1) % trailImages.length;

        // Se passarmos das 4 fotos (podes alterar para 3 se preferires), remove a mais antiga
        if (activeImages.length > 4) {
            const oldestImage = activeImages.shift();
            
            // Animação de saída (desvanece e encolhe)
            oldestImage.style.opacity = '0';
            oldestImage.style.transform = 'translate(-50%, -50%) scale(0.5)';
            
            // Espera a animação de saída terminar (0.4s) para a remover do HTML
            setTimeout(() => {
                if(oldestImage.parentNode) oldestImage.parentNode.removeChild(oldestImage);
            }, 400); 
        }
        
        // Truque para o browser assumir a animação de entrada perfeitamente
        requestAnimationFrame(() => {
            // Rotação aleatória entre -15 e 15 graus para parecerem polaroids atiradas à mesa
            const randomRotation = Math.random() * 30 - 15;
            img.style.opacity = '1';
            img.style.transform = `translate(-50%, -50%) scale(1) rotate(${randomRotation}deg)`; 
        });
    }
}
