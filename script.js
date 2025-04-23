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
    const btnFinalizarCompra = document.getElementById('btn-finalizar-compra'); // Abre o modal agora
    const carrinhoVazioMsg = document.getElementById('carrinho-vazio-msg');
    const welcomeScreen = document.getElementById('welcome-screen');
    const headerElement = document.querySelector('header');
    const headerLogoElement = document.getElementById('header-logo');
    const promoSection = document.getElementById('promo-section');
    const promoSwiperWrapper = promoSection ? promoSection.querySelector('.swiper-wrapper') : null;
    const contentWrapper = document.querySelector('.content-wrapper');
    const sideMenu = document.getElementById('side-menu');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle'); // Botão Hamburger
    const menuOverlay = document.getElementById('menu-overlay'); // Overlay
    const announcementsDiv = document.getElementById('store-announcements');
    const mainElement = document.querySelector('main');
    const footerElement = document.querySelector('footer');
    // Seletores do Modal de Entrega
    const deliveryModal = document.getElementById('delivery-modal');
    const deliveryForm = document.getElementById('delivery-form');
    const closeModalButton = deliveryModal ? deliveryModal.querySelector('.close-modal') : null; // Busca dentro do modal
    const deliveryErrorMessage = document.getElementById('delivery-error-message'); // Para mensagens de erro do form

    let produtos = [];
    let carrinho = [];
    let conteudoExtra = [];
    let duracaoAnimacaoEntrada = 3500;
    let swiperPromo = null;
    let currentCategory = 'all';

    // --- Funções do Menu Mobile ---
    function openMobileMenu() { if (sideMenu) sideMenu.classList.add('menu-open'); if (menuOverlay) menuOverlay.classList.add('active'); }
    function closeMobileMenu() { if (sideMenu) sideMenu.classList.remove('menu-open'); if (menuOverlay) menuOverlay.classList.remove('active'); }

     // --- Funções do Modal de Entrega ---
     function openDeliveryModal() {
         if (deliveryModal && deliveryForm) { // Verifica se form existe também
             console.log("Abrindo modal de entrega...");
             if (deliveryErrorMessage) deliveryErrorMessage.style.display = 'none';
             // Limpa classes de erro dos inputs
             deliveryForm.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
             // deliveryForm.reset(); // Descomente se quiser limpar o form toda vez que abrir
             deliveryModal.classList.add('modal-open');
         } else { console.error("Modal de entrega ou formulário não encontrado!"); }
     }
     // ### FUNÇÃO QUE FALTAVA ###
     function closeDeliveryModal() {
          if (deliveryModal) {
             console.log("Fechando modal de entrega...");
             deliveryModal.classList.remove('modal-open');
          }
      }
     // ##########################

    // --- Lógica da Animação de Boas-Vindas ---
    function iniciarAnimacaoBoasVindas() {
        if(typeof anime!=='function'){console.error("Anime.js não carregado!");duracaoAnimacaoEntrada=0;return 0;} if(!welcomeScreen)return 0; const l=welcomeScreen.querySelector('.welcome-logo');const t=welcomeScreen.querySelector('#welcome-title');if(t){t.innerHTML=t.textContent.replace(/([^\x00-\x80]|\w)/g,"<span class='letter'>$&</span>");} const tl=anime.timeline({easing:'easeInOutSine',complete:function(a){if(a.duration>0){duracaoAnimacaoEntrada=a.duration;console.log(`Duração REAL animação entrada: ${duracaoAnimacaoEntrada}ms`);}}}); tl.add({targets:'.animated-bg-element',opacity:[0,1],duration:500,delay:anime.stagger(100)},0); if(l){tl.add({targets:l,opacity:[0,1],scale:[0.5,1],rotateY:['-110deg','0deg'],duration:1600,easing:'easeOutExpo',boxShadow:['0 0 0px 0px rgba(228,175,74,0)','0 0 30px 10px rgba(228,175,74,0.4)','0 0 15px 3px rgba(228,175,74,0.3)']},300);} if(t){const o=l?1200:500;tl.add({targets:'#welcome-title',opacity:1,duration:50,},o-50).add({targets:'.ml12 .letter',opacity:[0,1],translateX:[40,0],translateZ:0,scaleX:[0.3,1],easing:"easeOutExpo",duration:800,delay:(el,i)=>150+25*i},o);} const est=l?1900:(t?2000:50); duracaoAnimacaoEntrada=est>50?est:3500; return est;
    }

    // --- Lógica da Transição Automática para Loja ---
    function iniciarTransicaoParaLoja(delayInicioFadeOut) {
        const tempoFadeOutTela=1000;const safeDelay=delayInicioFadeOut>100?delayInicioFadeOut:duracaoAnimacaoEntrada;console.log(`Fade-out Welcome após ${safeDelay}ms`); if(welcomeScreen&&headerElement&&headerLogoElement&&promoSection&&contentWrapper&&announcementsDiv&&mainElement&&footerElement&&btnAbrirCarrinho){setTimeout(()=>{welcomeScreen.classList.add('hidden');setTimeout(()=>{welcomeScreen.style.display='none';headerElement.style.display='flex';promoSection.style.display='';contentWrapper.style.display='flex';announcementsDiv.style.display='';footerElement.style.display='';btnAbrirCarrinho.style.display='flex';requestAnimationFrame(()=>{requestAnimationFrame(()=>{headerElement.classList.add('visible');promoSection.classList.add('visible');contentWrapper.classList.add('visible');announcementsDiv.classList.add('visible');footerElement.classList.add('visible');btnAbrirCarrinho.classList.add('visible');});});if(typeof anime==='function'){anime({targets:headerLogoElement,opacity:[0,1],scale:[0.5,1],duration:800,easing:'easeOutExpo',delay:100});}else if(headerLogoElement){headerLogoElement.style.opacity='1';headerLogoElement.style.transform='scale(1)';}carregarConteudoExtra();carregarProdutos().then(setupCategoryMenu);},tempoFadeOutTela);},safeDelay);}else{console.error("Elementos p/ transição não encontrados.");if(welcomeScreen)welcomeScreen.style.display='none';const els=[headerElement,headerLogoElement,promoSection,contentWrapper,announcementsDiv,mainElement,footerElement,btnAbrirCarrinho];els.forEach(el=>{if(el){if(el===headerElement||el===btnAbrirCarrinho||el===contentWrapper)el.style.display='flex';else if(el!==mainElement&&el!==sideMenu)el.style.display='';el.style.opacity='1';el.style.visibility='visible';if(el===headerLogoElement)el.style.transform='scale(1)';el.classList.add('visible');}});carregarConteudoExtra();carregarProdutos().then(setupCategoryMenu);}}

    // --- Carregar Conteúdo Extra (Promo/Anúncios) ---
    async function carregarConteudoExtra() {
        if(!promoSection&&!announcementsDiv)return;const adjDelays=()=>{if(headerElement)headerElement.style.transitionDelay='0s';if(contentWrapper)contentWrapper.style.transitionDelay='0.1s';if(announcementsDiv)announcementsDiv.style.transitionDelay='0.3s';if(footerElement)footerElement.style.transitionDelay='0.5s';if(btnAbrirCarrinho)btnAbrirCarrinho.style.transitionDelay='0.6s';};try{const r=await fetch('anuncios.json');if(r.status===404){console.log("anuncios.json não encontrado.");if(promoSection)promoSection.style.display='none';if(announcementsDiv)announcementsDiv.style.display='none';adjDelays();return;}if(!r.ok)throw new Error(`Erro HTTP: ${r.status}`);conteudoExtra=await r.json();exibirPromocoes(conteudoExtra.filter(i=>i.ativo&&i.tipo==='promocao'));exibirAnunciosGerais(conteudoExtra.filter(i=>i.ativo&&i.tipo!=='promocao'));}catch(e){console.error("Erro carregar anuncios.json:",e);if(promoSection)promoSection.style.display='none';if(announcementsDiv)announcementsDiv.style.display='none';adjDelays();}
    }

    // --- Exibir Promoções (Carrossel) ---
    function exibirPromocoes(promocoesAtivas) {
        if(!promoSection||!promoSwiperWrapper){if(promoSection)promoSection.style.display='none';if(headerElement)headerElement.style.transitionDelay='0s';if(contentWrapper)contentWrapper.style.transitionDelay='0.1s';if(announcementsDiv)announcementsDiv.style.transitionDelay='0.3s';if(footerElement)footerElement.style.transitionDelay='0.5s';if(btnAbrirCarrinho)btnAbrirCarrinho.style.transitionDelay='0.6s';return;} promoSwiperWrapper.innerHTML='';if(promocoesAtivas.length>0){promoSection.style.display='';promocoesAtivas.forEach(p=>{const l=p.link_instagram;const T=l?'a':'div';const s=document.createElement('div');s.className='swiper-slide';s.innerHTML=`<${T} class="promo-item-slide" ${l?`href="${l}" target="_blank" rel="noopener noreferrer"`:''}><img src="${p.imagem||''}" alt="${p.titulo||'Promo'}"><div class="promo-content"><h3>${p.titulo||''}</h3><p>${p.texto||''}</p></div></${T}>`;promoSwiperWrapper.appendChild(s);});requestAnimationFrame(()=>{if(typeof Swiper==='undefined'){console.error("Swiper não carregado!"); return;} if(swiperPromo){swiperPromo.destroy(true,true); swiperPromo=null;} if(promocoesAtivas.length>0){swiperPromo=new Swiper('.promo-swiper',{direction:'horizontal',loop:promocoesAtivas.length>1,autoplay:{delay:5000,disableOnInteraction:false},pagination:{el:'.swiper-pagination',clickable:true},navigation:{nextEl:'.swiper-button-next',prevEl:'.swiper-button-prev'},grabCursor:true,effect:'fade',fadeEffect:{crossFade:true},keyboard:{enabled:true}});}});requestAnimationFrame(()=>{requestAnimationFrame(()=>{promoSection.classList.add('visible');});});
        } else { promoSection.style.display='none'; /* ... adjusts delays ... */ if(headerElement)headerElement.style.transitionDelay='0s';if(contentWrapper)contentWrapper.style.transitionDelay='0.1s';if(announcementsDiv)announcementsDiv.style.transitionDelay='0.3s';if(footerElement)footerElement.style.transitionDelay='0.5s';if(btnAbrirCarrinho)btnAbrirCarrinho.style.transitionDelay='0.6s'; }
    }

    // --- Exibir Anúncios Gerais (Fim da Página) ---
    function exibirAnunciosGerais(anunciosAtivos) {
        if(!announcementsDiv)return;announcementsDiv.innerHTML='';if(anunciosAtivos.length>0){announcementsDiv.style.display='';if(!announcementsDiv.querySelector('h2')){const h2=document.createElement('h2');h2.textContent='Fique por Dentro';announcementsDiv.appendChild(h2);}const grid=document.createElement('div');grid.className='announcements-grid';anunciosAtivos.forEach(a=>{const i=document.createElement('div');i.className='announcement-item';let img=a.imagem?`<div class="announcement-image"><img src="${a.imagem}" alt="${a.titulo||'Anúncio'}"></div>`:'';let link=a.link_instagram?`<a href="${a.link_instagram}" target="_blank" rel="noopener noreferrer">Ver Mais</a>`:'';i.innerHTML=`${img}<div class="announcement-content"><h3>${a.titulo||'Novidade'}</h3><p>${a.texto||''}</p>${link}</div>`;grid.appendChild(i);});announcementsDiv.appendChild(grid);requestAnimationFrame(()=>{requestAnimationFrame(()=>{announcementsDiv.classList.add('visible');});});
        } else { announcementsDiv.style.display='none'; if(footerElement)footerElement.style.transitionDelay=(promoSection.style.display==='none'?'0.3s':'0.5s');if(btnAbrirCarrinho)btnAbrirCarrinho.style.transitionDelay=(promoSection.style.display==='none'?'0.4s':'0.6s'); }
    }

    // --- Carrega Produtos ---
    async function carregarProdutos() {
        if(skeletonWrapper&&!listaProdutosDiv.querySelector('.produto-card')){skeletonWrapper.style.display='grid';}else if(listaProdutosDiv&&!listaProdutosDiv.querySelector('.produto-card')&&!skeletonWrapper){listaProdutosDiv.innerHTML=`<p style='text-align:center; padding:40px; font-size:1.2em; color:var(--cor-texto-secundario);'>Carregando...</p>`;} try{const r=await fetch('products.json');if(!r.ok){throw new Error(`Erro HTTP: ${r.status}`);}produtos=await r.json();console.log("Produtos carregados:",produtos);}catch(e){console.error("Erro carregar products.json:",e);if(listaProdutosDiv){listaProdutosDiv.innerHTML=`<p style='text-align:center; padding:40px; font-size:1.2em; color:var(--cor-erro);'>Erro carregar produtos.<br>Verifique console.</p>`;}if(skeletonWrapper)skeletonWrapper.style.display='none';}
    }

    // --- Exibir Produtos (com Filtro) ---
    function exibirProdutos() {
        if(!listaProdutosDiv)return;if(skeletonWrapper)skeletonWrapper.style.display='none';listaProdutosDiv.innerHTML='';let prods=produtos;if(currentCategory&&currentCategory!=='all'){prods=produtos.filter(p=>p.categoria&&typeof p.categoria==='string'&&p.categoria.toLowerCase()===currentCategory.toLowerCase());} if(!prods||prods.length===0){const m=currentCategory==='all'?'Nenhum produto cadastrado.':`Nenhum produto encontrado na categoria "${currentCategory}".`;listaProdutosDiv.innerHTML=`<p style='text-align:center; padding:40px; font-size:1.2em; color:var(--cor-texto-secundario);'>${m}</p>`;return;} prods.forEach(p=>{const card=document.createElement('div');card.className='produto-card';card.setAttribute('data-id',p.id);const pN=parseFloat(p.preco);const pF=isNaN(pN)?'---':pN.toFixed(2).replace('.',',');const img=p.imagem||'';card.innerHTML=`${img?`<img src="${img}" alt="${p.nome||'Prod'}" class="produto-imagem" loading="lazy">`:'<div class="imagem-placeholder">Sem Imagem</div>'}<div class="produto-info"><div><h3 class="produto-nome">${p.nome||'Prod s/ nome'}</h3><p class="produto-descricao">${p.descricao||''}</p></div><div><p class="produto-preco">R$ ${pF}</p><button class="btn-adicionar" data-id="${p.id}"><i class="fas fa-cart-plus"></i> Adicionar</button></div></div>`;listaProdutosDiv.appendChild(card);});adicionarListenersBotoesAdicionar();}

    // --- Configuração do Menu de Categorias ---
    function setupCategoryMenu() {
        if (!sideMenu) { console.error("Menu lateral não encontrado"); return; }
        const menuList = sideMenu.querySelector('ul');
        if (!menuList) { console.error("Lista de categorias não encontrada."); return;}
        menuList.addEventListener('click', (event) => { if (event.target && event.target.classList.contains('category-button')) { const button = event.target; menuList.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active-category')); button.classList.add('active-category'); currentCategory = button.getAttribute('data-category'); console.log("Categoria selecionada:", currentCategory); exibirProdutos(); if (sideMenu.classList.contains('menu-open')) { closeMobileMenu(); } } });
        exibirProdutos(); // Exibe todos inicialmente
    }

    // --- Listeners Botão Adicionar ---
    function adicionarListenersBotoesAdicionar() { document.querySelectorAll('.btn-adicionar').forEach(b=>{const cl=b.cloneNode(true);b.parentNode.replaceChild(cl,b);cl.addEventListener('click',(e)=>{const id=e.target.closest('button').getAttribute('data-id');adicionarAoCarrinho(id);e.target.style.transform='scale(0.95)';e.target.style.transition='transform 0.1s ease-out';setTimeout(()=>{e.target.style.transform='scale(1)';},100);});});}

    // --- Lógica do Carrinho ---
    function adicionarAoCarrinho(id){const p=produtos.find(p=>p.id===id);if(!p)return;const i=carrinho.find(i=>i.id===id);if(i)i.quantidade++;else{const n=parseFloat(p.preco);if(isNaN(n))return;carrinho.push({id:p.id,nome:p.nome,preco:n,quantidade:1});}atualizarCarrinhoVisual();salvarCarrinhoLocalStorage();}
    function removerDoCarrinho(id){const idx=carrinho.findIndex(i=>i.id===id);if(idx>-1){carrinho.splice(idx,1);atualizarCarrinhoVisual();salvarCarrinhoLocalStorage();}}
    function atualizarCarrinhoVisual(){if(!itensCarrinhoUl||!totalCarrinhoSpan||!contadorCarrinhoSpan||!carrinhoVazioMsg||!btnFinalizarCompra)return;itensCarrinhoUl.innerHTML='';let t=0;let c=0;if(carrinho.length===0){carrinhoVazioMsg.style.display='list-item';btnFinalizarCompra.disabled=true;}else{carrinhoVazioMsg.style.display='none';btnFinalizarCompra.disabled=false;carrinho.forEach(item=>{const li=document.createElement('li');const p=parseFloat(item.preco);const q=parseInt(item.quantidade,10);if(!isNaN(p)&&!isNaN(q)){const subt=p*q;t+=subt;c+=q;li.innerHTML=`<span class="carrinho-item-info">${q}x ${item.nome}</span> <span class="carrinho-item-preco">R$ ${subt.toFixed(2).replace('.',',')}</span> <button class="btn-remover-item" data-id="${item.id}" title="Remover Item"><i class="fas fa-trash-alt"></i></button>`;itensCarrinhoUl.appendChild(li);}});adicionarListenersBotoesRemover();}totalCarrinhoSpan.textContent=t.toFixed(2).replace('.',',');contadorCarrinhoSpan.textContent=c;}
    function adicionarListenersBotoesRemover(){document.querySelectorAll('.btn-remover-item').forEach(b=>{const cl=b.cloneNode(true);b.parentNode.replaceChild(cl,b);cl.addEventListener('click',(e)=>{const id=e.target.closest('button').getAttribute('data-id');removerDoCarrinho(id);});});}

    // --- Abrir e Fechar Carrinho / Menu Mobile ---
    if (btnAbrirCarrinho && carrinhoSection) btnAbrirCarrinho.addEventListener('click', () => carrinhoSection.classList.add('aberto'));
    if (btnFecharCarrinho && carrinhoSection) btnFecharCarrinho.addEventListener('click', () => carrinhoSection.classList.remove('aberto'));
    if (mobileMenuToggle && sideMenu) { mobileMenuToggle.addEventListener('click', (e) => { console.log("Hamburger button clicked!"); e.stopPropagation(); if (sideMenu.classList.contains('menu-open')) { closeMobileMenu(); } else { openMobileMenu(); } }); } else { console.error("Botão toggle ou sideMenu não encontrado!"); }
    if (menuOverlay) { menuOverlay.addEventListener('click', () => { console.log("Overlay clicked!"); closeMobileMenu(); }); } else { console.error("Menu overlay não encontrado!"); }

    // --- Abrir Modal de Entrega --- (Listener do Botão Finalizar Compra)
    if (btnFinalizarCompra) {
        btnFinalizarCompra.addEventListener('click', () => {
            if (carrinho.length > 0) {
                openDeliveryModal(); // Chama a função para abrir o modal
            } else {
                alert("Seu carrinho está vazio!");
            }
        });
    } else { console.error("Botão Finalizar Compra não encontrado!"); }

    // --- Fechar Modal de Entrega ---
    if (closeModalButton) { closeModalButton.addEventListener('click', closeDeliveryModal); } // <-- Listener usa a função
    if (deliveryModal) { deliveryModal.addEventListener('click', (event) => { if (event.target === deliveryModal) { closeDeliveryModal(); } }); } // <-- Listener usa a função

    // --- Processar Formulário de Entrega e Enviar WhatsApp ---
    if (deliveryForm) {
        deliveryForm.addEventListener('submit', (event) => {
            event.preventDefault(); console.log("Formulário de entrega submetido.");
            if (deliveryErrorMessage) deliveryErrorMessage.style.display = 'none';
            deliveryForm.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
            let formIsValid = true; const requiredFields = deliveryForm.querySelectorAll('[required]');
            requiredFields.forEach(input => { if (!input.value.trim()) { formIsValid = false; input.classList.add('input-error'); } else { input.classList.remove('input-error'); } });
            if (!formIsValid) { if(deliveryErrorMessage){deliveryErrorMessage.textContent="Por favor, preencha todos os campos obrigatórios."; deliveryErrorMessage.style.display='block';}else{alert("Por favor, preencha todos os campos obrigatórios.");} return; }
            const formData = new FormData(deliveryForm); const deliveryData = Object.fromEntries(formData.entries());
            if (carrinho.length === 0) { alert("Seu carrinho ficou vazio!"); closeDeliveryModal(); return; };
            let mensagem = `Olá, Tammy's Store! 👋 Pedido:\n\n`; let totalPedido = 0;
            carrinho.forEach(item => { const subtotal = parseFloat(item.preco) * parseInt(item.quantidade, 10); if (!isNaN(subtotal)) { mensagem += `*${item.quantidade}x* ${item.nome}\n_(Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')})_\n\n`; totalPedido += subtotal; } });
            mensagem += `*Total dos Produtos: R$ ${totalPedido.toFixed(2).replace('.', ',')}*\n\n`;
            mensagem += `--- DADOS PARA ENTREGA ---\n`;
            mensagem += `Nome: ${deliveryData.fullname || '-'}\n`; if (deliveryData.phone) mensagem += `Telefone: ${deliveryData.phone}\n`; mensagem += `CEP: ${deliveryData.zipcode || '-'}\n`; mensagem += `Endereço: ${deliveryData.street || '-'}, ${deliveryData.number || 'S/N'}\n`; if (deliveryData.complement) mensagem += `Compl: ${deliveryData.complement}\n`; mensagem += `Bairro: ${deliveryData.neighborhood || '-'}\n`; mensagem += `Cidade: ${deliveryData.city || '-'}\n`; mensagem += `Estado: ${deliveryData.state || '-'}\n`; if (deliveryData.reference) mensagem += `Ref: ${deliveryData.reference}\n`; mensagem += `--------------------------\n\n`; mensagem += `Aguardo confirmação e dados para pagamento PIX. Obrigado! 😊`;
            const seuNumeroWhatsApp = '5511975938366'; if (seuNumeroWhatsApp.length < 12 || !/^\d+$/.test(seuNumeroWhatsApp)) { alert("Erro: Número WhatsApp configurado inválido."); return; } const linkWhatsApp = `https://wa.me/${seuNumeroWhatsApp}?text=${encodeURIComponent(mensagem)}`; console.log("Abrindo WhatsApp com pedido e endereço:", linkWhatsApp); window.open(linkWhatsApp, '_blank');
            closeDeliveryModal(); // Fecha o modal após enviar
        });
    } else { console.error("Formulário de entrega não encontrado!"); }

     // --- Persistência do Carrinho ---
     function salvarCarrinhoLocalStorage() { try { localStorage.setItem('carrinhoTammyStore', JSON.stringify(carrinho)); } catch (e) { console.error("Erro salvar carrinho:", e); } }
     function carregarCarrinhoLocalStorage() { try { const c = localStorage.getItem('carrinhoTammyStore'); carrinho = c ? JSON.parse(c) : []; } catch (e) { console.error("Erro carregar carrinho:", e); carrinho = []; } }

    // --- Inicialização ---
    const duracaoEstimada = iniciarAnimacaoBoasVindas();
    const tempoPausa = 1200;
     setTimeout(() => { const delayReal = duracaoAnimacaoEntrada > 100 ? duracaoAnimacaoEntrada : duracaoEstimada; iniciarTransicaoParaLoja(delayReal + tempoPausa); }, 50);
    carregarCarrinhoLocalStorage();
    atualizarCarrinhoVisual();
    // Conteúdo e produtos carregados DENTRO de iniciarTransicaoParaLoja

}); // Fim do DOMContentLoaded