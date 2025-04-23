// Espera o HTML carregar completamente
document.addEventListener('DOMContentLoaded', () => {

    // --- Seleção dos Elementos Globais ---
    const listaProdutosDiv = document.getElementById('lista-produtos');
    const skeletonWrapper = listaProdutosDiv ? listaProdutosDiv.querySelector('.skeleton-wrapper') : null;
    const carrinhoSection = document.getElementById('carrinho');
    const itensCarrinhoUl = document.getElementById('itens-carrinho');
    const totalCarrinhoSpan = document.getElementById('total-carrinho');
    const contadorCarrinhoSpan = document.getElementById('contador-carrinho');
    const btnAbrirCarrinho = document.getElementById('btn-abrir-carrinho');
    const btnFecharCarrinho = document.getElementById('btn-fechar-carrinho');
    const btnFinalizarCompra = document.getElementById('btn-finalizar-compra');
    const carrinhoVazioMsg = document.getElementById('carrinho-vazio-msg');
    const welcomeScreen = document.getElementById('welcome-screen');
    const headerElement = document.querySelector('header');
    const headerLogoElement = document.getElementById('header-logo');
    const promoSection = document.getElementById('promo-section');
    const promoSwiperWrapper = promoSection ? promoSection.querySelector('.swiper-wrapper') : null;
    const contentWrapper = document.querySelector('.content-wrapper');
    const sideMenu = document.getElementById('side-menu');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const menuOverlay = document.getElementById('menu-overlay');
    const announcementsDiv = document.getElementById('store-announcements');
    const mainElement = document.querySelector('main');
    const footerElement = document.querySelector('footer');

    let produtos = [];
    let carrinho = [];
    let conteudoExtra = [];
    let duracaoAnimacaoEntrada = 3500; // Aumenta duração padrão estimada
    let swiperPromo = null;
    let currentCategory = 'all';

    // --- Funções do Menu Mobile ---
    function openMobileMenu() {
        if (sideMenu) sideMenu.classList.add('menu-open');
        if (menuOverlay) menuOverlay.classList.add('active');
        // document.body.style.overflow = 'hidden'; // Descomente para travar scroll
    }
    function closeMobileMenu() {
        if (sideMenu) sideMenu.classList.remove('menu-open');
        if (menuOverlay) menuOverlay.classList.remove('active');
        // document.body.style.overflow = ''; // Descomente para restaurar scroll
    }

    // --- Lógica da Animação de Boas-Vindas (Mais Cinematográfica) ---
    function iniciarAnimacaoBoasVindas() {
        if (typeof anime !== 'function') { console.error("Anime.js não carregado!"); duracaoAnimacaoEntrada = 0; return 0; }
        if (!welcomeScreen) return 0;

        const logo = welcomeScreen.querySelector('.welcome-logo');
        const title = welcomeScreen.querySelector('#welcome-title');
        const bgElements = welcomeScreen.querySelectorAll('.animated-bg-element');

        // Prepara título para animação por letra (ML2 - com ajuste)
        if (title) {
             title.innerHTML = title.textContent.replace(/\S/g, "<span class='letter'>$&</span>");
        }

        const tl = anime.timeline({
            easing: 'easeInOutSine', // Um easing mais suave
            complete: function(anim) { if (anim.duration > 0) { duracaoAnimacaoEntrada = anim.duration; console.log(`Duração REAL animação entrada: ${duracaoAnimacaoEntrada}ms`); } }
        });

        // 1. Animação Sutil dos Elementos de Fundo (se existirem)
        if (bgElements.length > 0) {
             tl.add({
                 targets: bgElements,
                 opacity: [0, 1],
                 translateY: ['-30px', '0px'], // Leve movimento vertical
                 delay: anime.stagger(100),
                 duration: 1500,
             }, 0); // Começa no início
         }

        // 2. Animação do Logo (Mais elaborada)
        if (logo) {
            tl.add({
                targets: logo,
                opacity: [0, 1],
                scale: [0.5, 1],
                rotateY: [-90, 0], // Efeito de virar
                duration: 1500,
                easing: 'easeOutElastic(1, .8)', // Efeito elástico
            }, 500); // Começa após 500ms
        }

        // 3. Animação do Título (ML2 - Staggered Fade + Slide)
        if (title) {
            const titleOffset = logo ? 1500 : 800; // Delay baseado na existência do logo
            tl.add({
                targets: '.ml2 .letter',
                opacity: [0,1],
                translateY: [50,0], // Entra de baixo
                translateZ: 0,
                rotateX: [-40, 0], // Leve rotação 3D
                scale: [0.8, 1], // Começa menor
                easing: "easeOutExpo",
                duration: 1400, // Mais longo
                delay: anime.stagger(80, {start: titleOffset}) // Stagger com delay inicial
            }, 0); // Adiciona à timeline geral, mas o delay controla início
        }

        // Estimativa inicial (ajuste conforme a animação mais longa)
        const estimatedDuration = logo ? 2000 : (title ? 2500 : 50); // Baseado no término do logo ou título
        duracaoAnimacaoEntrada = estimatedDuration > 50 ? estimatedDuration : 3500;
        return estimatedDuration;
    } // Fim iniciarAnimacaoBoasVindas

    // --- Lógica da Transição Automática para Loja ---
    function iniciarTransicaoParaLoja(delayInicioFadeOut) { /* ...código transição ... */
        const tempoFadeOutTela = 1000; /* Aumenta tempo do fade out */ const safeDelay = delayInicioFadeOut > 100 ? delayInicioFadeOut : duracaoAnimacaoEntrada; console.log(`Iniciando fade-out da Welcome Screen após ${safeDelay}ms`);
        if (welcomeScreen && headerElement && headerLogoElement && promoSection && contentWrapper && announcementsDiv && mainElement && footerElement && btnAbrirCarrinho) { setTimeout(() => { welcomeScreen.classList.add('hidden'); setTimeout(() => { welcomeScreen.style.display = 'none'; headerElement.style.display = 'flex'; promoSection.style.display = ''; contentWrapper.style.display = 'flex'; announcementsDiv.style.display = ''; footerElement.style.display = ''; btnAbrirCarrinho.style.display = 'flex'; requestAnimationFrame(() => { requestAnimationFrame(() => { headerElement.classList.add('visible'); promoSection.classList.add('visible'); contentWrapper.classList.add('visible'); announcementsDiv.classList.add('visible'); footerElement.classList.add('visible'); btnAbrirCarrinho.classList.add('visible'); }); }); if(typeof anime === 'function'){anime({ targets: headerLogoElement, opacity: [0, 1], scale: [0.5, 1], duration: 800, easing: 'easeOutExpo', delay: 100 });} else if(headerLogoElement){headerLogoElement.style.opacity='1';headerLogoElement.style.transform='scale(1)';} carregarConteudoExtra(); carregarProdutos().then(setupCategoryMenu); }, tempoFadeOutTela); }, safeDelay);
        } else { console.error("Elementos essenciais não encontrados para transição."); if(welcomeScreen) welcomeScreen.style.display = 'none'; const elementsToShow=[headerElement,headerLogoElement,promoSection,contentWrapper,announcementsDiv,mainElement,footerElement,btnAbrirCarrinho]; elementsToShow.forEach(el=>{if(el){if(el===headerElement||el===btnAbrirCarrinho||el===contentWrapper)el.style.display='flex';else if(el!==mainElement&&el!==sideMenu)el.style.display='';el.style.opacity='1';el.style.visibility='visible';if(el===headerLogoElement)el.style.transform='scale(1)';el.classList.add('visible');}}); carregarConteudoExtra(); carregarProdutos().then(setupCategoryMenu); }
    }

    // --- Carregar Conteúdo Extra ---
    async function carregarConteudoExtra() { /* ...código carregarConteudoExtra ... */
        if (!promoSection && !announcementsDiv) return; const adjustDelaysFallback = () => { if(headerElement) headerElement.style.transitionDelay = '0s'; if(contentWrapper) contentWrapper.style.transitionDelay = '0.1s'; if(announcementsDiv) announcementsDiv.style.transitionDelay = '0.3s'; if(footerElement) footerElement.style.transitionDelay = '0.5s'; if(btnAbrirCarrinho) btnAbrirCarrinho.style.transitionDelay = '0.6s'; }; try { const r=await fetch('anuncios.json'); if(r.status===404){console.log("anuncios.json não encontrado.");if(promoSection)promoSection.style.display='none';if(announcementsDiv)announcementsDiv.style.display='none';adjustDelaysFallback();return;} if(!r.ok)throw new Error(`Erro HTTP: ${r.status}`); conteudoExtra=await r.json(); exibirPromocoes(conteudoExtra.filter(i=>i.ativo&&i.tipo==='promocao')); exibirAnunciosGerais(conteudoExtra.filter(i=>i.ativo&&i.tipo!=='promocao')); } catch(e){ console.error("Erro carregar anuncios.json:",e); if(promoSection)promoSection.style.display='none'; if(announcementsDiv)announcementsDiv.style.display='none'; adjustDelaysFallback();}
    }

    // --- Exibir Promoções (Carrossel) ---
    function exibirPromocoes(promocoesAtivas) { /* ...código exibirPromocoes com SwiperJS ... */
        if (!promoSection || !promoSwiperWrapper) { /* ... fallback hides/adjusts ... */ if(promoSection)promoSection.style.display='none'; if(headerElement)headerElement.style.transitionDelay='0s'; if(contentWrapper)contentWrapper.style.transitionDelay='0.1s'; if(announcementsDiv)announcementsDiv.style.transitionDelay='0.3s'; if(footerElement)footerElement.style.transitionDelay='0.5s'; if(btnAbrirCarrinho)btnAbrirCarrinho.style.transitionDelay='0.6s'; return; }
        promoSwiperWrapper.innerHTML = ''; if (promocoesAtivas.length > 0) { promoSection.style.display=''; promocoesAtivas.forEach(p=>{const l=p.link_instagram; const T=l?'a':'div'; const s=document.createElement('div'); s.className='swiper-slide'; s.innerHTML=`<${T} class="promo-item-slide" ${l?`href="${l}" target="_blank" rel="noopener noreferrer"`:''}><img src="${p.imagem||''}" alt="${p.titulo||'Promo'}"><div class="promo-content"><h3>${p.titulo||''}</h3><p>${p.texto||''}</p></div></${T}>`; promoSwiperWrapper.appendChild(s);}); requestAnimationFrame(()=>{if(typeof Swiper==='undefined'){console.error("Swiper não carregado!"); return;} if(swiperPromo){swiperPromo.destroy(true,true); swiperPromo=null;} if(promocoesAtivas.length>0){swiperPromo=new Swiper('.promo-swiper',{/* Swiper Options */direction:'horizontal',loop:promocoesAtivas.length>1,autoplay:{delay:5000, /* Maior delay */ disableOnInteraction:false},pagination:{el:'.swiper-pagination',clickable:true},navigation:{nextEl:'.swiper-button-next',prevEl:'.swiper-button-prev'},grabCursor:true,effect:'fade',fadeEffect:{crossFade:true},keyboard:{enabled:true}});}}); requestAnimationFrame(()=>{requestAnimationFrame(()=>{promoSection.classList.add('visible');});});
        } else { promoSection.style.display = 'none'; /* ... adjusts delays ... */ if(headerElement)headerElement.style.transitionDelay='0s'; if(contentWrapper)contentWrapper.style.transitionDelay='0.1s'; if(announcementsDiv)announcementsDiv.style.transitionDelay='0.3s'; if(footerElement)footerElement.style.transitionDelay='0.5s'; if(btnAbrirCarrinho)btnAbrirCarrinho.style.transitionDelay='0.6s'; }
    }

    // --- Exibir Anúncios Gerais (Fim da Página) ---
    function exibirAnunciosGerais(anunciosAtivos) { /* ...código exibirAnunciosGerais ... */
        if (!announcementsDiv) return; announcementsDiv.innerHTML = ''; if (anunciosAtivos.length > 0) { announcementsDiv.style.display=''; if (!announcementsDiv.querySelector('h2')) { const h2=document.createElement('h2'); h2.textContent='Fique por Dentro'; announcementsDiv.appendChild(h2); } const grid=document.createElement('div'); grid.className='announcements-grid'; anunciosAtivos.forEach(a=>{const i=document.createElement('div');i.className='announcement-item'; let img=a.imagem?`<div class="announcement-image"><img src="${a.imagem}" alt="${a.titulo||'Anúncio'}"></div>`:''; let link=a.link_instagram?`<a href="${a.link_instagram}" target="_blank" rel="noopener noreferrer">Ver Mais</a>`:''; i.innerHTML=`${img}<div class="announcement-content"><h3>${a.titulo||'Novidade'}</h3><p>${a.texto||''}</p>${link}</div>`; grid.appendChild(i);}); announcementsDiv.appendChild(grid); requestAnimationFrame(()=>{requestAnimationFrame(()=>{announcementsDiv.classList.add('visible');});});
        } else { announcementsDiv.style.display='none'; if(footerElement)footerElement.style.transitionDelay=(promoSection.style.display==='none'?'0.3s':'0.5s'); if(btnAbrirCarrinho)btnAbrirCarrinho.style.transitionDelay=(promoSection.style.display==='none'?'0.4s':'0.6s'); }
    }

    // --- Carrega Produtos ---
    async function carregarProdutos() { /* ...código carregar produtos ... */
        if(skeletonWrapper && !listaProdutosDiv.querySelector('.produto-card')){skeletonWrapper.style.display='grid';}else if(listaProdutosDiv&&!listaProdutosDiv.querySelector('.produto-card')&&!skeletonWrapper){listaProdutosDiv.innerHTML=`<p style='text-align:center; padding:40px; font-size:1.2em; color:var(--cor-texto-secundario);'>Carregando...</p>`;} try{const r=await fetch('products.json');if(!r.ok){throw new Error(`Erro HTTP: ${r.status}`);}produtos=await r.json();console.log("Produtos carregados:",produtos);/* exibirProdutos() será chamado por setupCategoryMenu ou filtro inicial */;}catch(e){console.error("Erro carregar products.json:",e);if(listaProdutosDiv){listaProdutosDiv.innerHTML=`<p style='text-align:center; padding:40px; font-size:1.2em; color:var(--cor-erro);'>Erro carregar produtos.<br>Verifique console (F12).</p>`;}if(skeletonWrapper)skeletonWrapper.style.display='none';}
    }

    // --- Exibir Produtos (com Filtro) ---
    function exibirProdutos() { /* ...código exibir produtos com filtro ... */
        if(!listaProdutosDiv)return;if(skeletonWrapper)skeletonWrapper.style.display='none';listaProdutosDiv.innerHTML=''; let prodsFiltrados=produtos;if(currentCategory&&currentCategory!=='all'){prodsFiltrados=produtos.filter(p=>p.categoria&&typeof p.categoria==='string'&&p.categoria.toLowerCase()===currentCategory.toLowerCase());} if(!prodsFiltrados||prodsFiltrados.length===0){const msg=currentCategory==='all'?'Nenhum produto cadastrado.':`Nenhum produto encontrado na categoria "${currentCategory}".`;listaProdutosDiv.innerHTML=`<p style='text-align:center; padding:40px; font-size:1.2em; color:var(--cor-texto-secundario);'>${msg}</p>`;return;} prodsFiltrados.forEach(p=>{const card=document.createElement('div');card.className='produto-card';card.setAttribute('data-id',p.id);const precoN=parseFloat(p.preco);const precoF=isNaN(precoN)?'---':precoN.toFixed(2).replace('.',',');const img=p.imagem?p.imagem:'';card.innerHTML=`${img?`<img src="${img}" alt="${p.nome||'Prod'}" class="produto-imagem" loading="lazy">`:'<div class="imagem-placeholder">Sem Imagem</div>'}<div class="produto-info"><div><h3 class="produto-nome">${p.nome||'Prod s/ nome'}</h3><p class="produto-descricao">${p.descricao||''}</p></div><div><p class="produto-preco">R$ ${precoF}</p><button class="btn-adicionar" data-id="${p.id}"><i class="fas fa-cart-plus"></i> Adicionar</button></div></div>`;listaProdutosDiv.appendChild(card);});adicionarListenersBotoesAdicionar();}

    // --- Configuração do Menu de Categorias ---
    function setupCategoryMenu() { /* ...código setup menu ... */
        if (!sideMenu) return; const menuList = sideMenu.querySelector('ul'); if (!menuList) return;
        menuList.addEventListener('click',(e)=>{if(e.target&&e.target.classList.contains('category-button')){const btn=e.target;menuList.querySelectorAll('.category-button').forEach(b=>b.classList.remove('active-category'));btn.classList.add('active-category');currentCategory=btn.getAttribute('data-category');console.log("Categoria:",currentCategory);exibirProdutos();if(sideMenu.classList.contains('menu-open')){closeMobileMenu();}}});
        // Exibe todos inicialmente
        exibirProdutos();
    }

    // --- Listeners Botão Adicionar ---
    function adicionarListenersBotoesAdicionar() { /* ...código listeners botão adicionar ... */ document.querySelectorAll('.btn-adicionar').forEach(b=>{const cl=b.cloneNode(true);b.parentNode.replaceChild(cl,b);cl.addEventListener('click',(e)=>{const id=e.target.closest('button').getAttribute('data-id');adicionarAoCarrinho(id);e.target.style.transform='scale(0.95)';e.target.style.transition='transform 0.1s ease-out';setTimeout(()=>{e.target.style.transform='scale(1)';},100);});});}

    // --- Lógica do Carrinho ---
    function adicionarAoCarrinho(id){/* ...código adicionar carrinho ... */ const p=produtos.find(p=>p.id===id);if(!p)return;const i=carrinho.find(i=>i.id===id);if(i)i.quantidade++;else{const n=parseFloat(p.preco);if(isNaN(n))return;carrinho.push({id:p.id,nome:p.nome,preco:n,quantidade:1});}atualizarCarrinhoVisual();salvarCarrinhoLocalStorage();}
    function removerDoCarrinho(id){/* ...código remover carrinho ... */ const idx=carrinho.findIndex(i=>i.id===id);if(idx>-1){carrinho.splice(idx,1);atualizarCarrinhoVisual();salvarCarrinhoLocalStorage();}}
    function atualizarCarrinhoVisual(){/* ...código atualizar visual carrinho ... */ if(!itensCarrinhoUl||!totalCarrinhoSpan||!contadorCarrinhoSpan||!carrinhoVazioMsg||!btnFinalizarCompra)return;itensCarrinhoUl.innerHTML='';let t=0;let c=0;if(carrinho.length===0){carrinhoVazioMsg.style.display='list-item';btnFinalizarCompra.disabled=true;}else{carrinhoVazioMsg.style.display='none';btnFinalizarCompra.disabled=false;carrinho.forEach(item=>{const li=document.createElement('li');const p=parseFloat(item.preco);const q=parseInt(item.quantidade,10);if(!isNaN(p)&&!isNaN(q)){const subt=p*q;t+=subt;c+=q;li.innerHTML=`<span class="carrinho-item-info">${q}x ${item.nome}</span> <span class="carrinho-item-preco">R$ ${subt.toFixed(2).replace('.',',')}</span> <button class="btn-remover-item" data-id="${item.id}" title="Remover Item"><i class="fas fa-trash-alt"></i></button>`;itensCarrinhoUl.appendChild(li);}});adicionarListenersBotoesRemover();}totalCarrinhoSpan.textContent=t.toFixed(2).replace('.',',');contadorCarrinhoSpan.textContent=c;}
    function adicionarListenersBotoesRemover(){/* ...código listeners botão remover ... */ document.querySelectorAll('.btn-remover-item').forEach(b=>{const cl=b.cloneNode(true);b.parentNode.replaceChild(cl,b);cl.addEventListener('click',(e)=>{const id=e.target.closest('button').getAttribute('data-id');removerDoCarrinho(id);});});}

    // --- Abrir e Fechar Carrinho / Menu Mobile ---
    if (btnAbrirCarrinho && carrinhoSection) btnAbrirCarrinho.addEventListener('click', () => carrinhoSection.classList.add('aberto'));
    if (btnFecharCarrinho && carrinhoSection) btnFecharCarrinho.addEventListener('click', () => carrinhoSection.classList.remove('aberto'));
    if (mobileMenuToggle && sideMenu) { mobileMenuToggle.addEventListener('click', (e) => { e.stopPropagation(); if (sideMenu.classList.contains('menu-open')) { closeMobileMenu(); } else { openMobileMenu(); } }); }
    if (menuOverlay) { menuOverlay.addEventListener('click', closeMobileMenu); }

    // --- Finalizar Compra (WhatsApp) ---
    if (btnFinalizarCompra) { btnFinalizarCompra.addEventListener('click', () => { /* ...código WhatsApp ... */ if(carrinho.length===0)return; let msg=`Olá, Tammy's Store! 👋 Pedido:\n\n`;let total=0;carrinho.forEach(i=>{const s=parseFloat(i.preco)*parseInt(i.quantidade,10);if(!isNaN(s)){msg+=`*${i.quantidade}x* ${i.nome}\n_(Subtotal: R$ ${s.toFixed(2).replace('.',',')})_\n\n`;total+=s;}});msg+=`*Total: R$ ${total.toFixed(2).replace('.',',')}*\n\nAguardando validação e PIX. 😊`; const num='5511975938366'; if(num.length<12||!/^\d+$/.test(num)){alert("Erro: Número WhatsApp inválido.");console.error("Número WhatsApp inválido:", num);return;}const link=`https://wa.me/${num}?text=${encodeURIComponent(msg)}`;console.log("Abrindo WhatsApp link:", link);window.open(link,'_blank');});}

     // --- Persistência do Carrinho ---
     function salvarCarrinhoLocalStorage() { /* ...código salvar carrinho ... */ try { localStorage.setItem('carrinhoTammyStore', JSON.stringify(carrinho)); } catch (e) { console.error("Erro salvar carrinho:", e); } }
     function carregarCarrinhoLocalStorage() { /* ...código carregar carrinho ... */ try { const c = localStorage.getItem('carrinhoTammyStore'); carrinho = c ? JSON.parse(c) : []; } catch (e) { console.error("Erro carregar carrinho:", e); carrinho = []; } }

    // --- Inicialização ---
    const duracaoEstimada = iniciarAnimacaoBoasVindas();
    const tempoPausa = 1200; // Aumenta um pouco a pausa
     setTimeout(() => { const delayReal = duracaoAnimacaoEntrada > 100 ? duracaoAnimacaoEntrada : duracaoEstimada; iniciarTransicaoParaLoja(delayReal + tempoPausa); }, 50);
    carregarCarrinhoLocalStorage();
    atualizarCarrinhoVisual();
    // Conteúdo extra e produtos são carregados DENTRO de iniciarTransicaoParaLoja
    // setupCategoryMenu agora é chamado DEPOIS de carregarProdutos

}); // Fim do DOMContentLoaded