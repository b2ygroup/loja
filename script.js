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
    const promoSwiperWrapper = promoSection ? promoSection.querySelector('.swiper-wrapper') : null; // Wrapper do Swiper
    const announcementsDiv = document.getElementById('store-announcements');
    const mainElement = document.querySelector('main');
    const footerElement = document.querySelector('footer');

    let produtos = [];
    let carrinho = [];
    let conteudoExtra = [];
    let duracaoAnimacaoEntrada = 3000;
    let swiperPromo = null; // Variável para guardar a instância do Swiper

    // --- Lógica da Animação de Boas-Vindas com Anime.js ---
    function iniciarAnimacaoBoasVindas() { /* ...código animação welcome ... */
        if(typeof anime!=='function'){console.error("Anime.js não carregado!");return duracaoAnimacaoEntrada;} if(!welcomeScreen)return 0; const logo=welcomeScreen.querySelector('.welcome-logo'); const title=welcomeScreen.querySelector('#welcome-title'); if(title){title.innerHTML=title.textContent.replace(/\S/g,"<span class='letter'>$&</span>");} const tl=anime.timeline({easing:'easeOutExpo',complete:function(anim){duracaoAnimacaoEntrada=anim.duration;console.log(`Duração REAL animação entrada: ${duracaoAnimacaoEntrada}ms`);}}); if(logo){tl.add({targets:logo,opacity:[0,1],scale:[0.7,1],duration:1200,easing:'spring(1, 80, 10, 0)'});} if(title){tl.add({targets:'#welcome-title',opacity:1,duration:50},(logo?'-=900':'+=100')).add({targets:'#welcome-title .letter',opacity:[0,1],translateY:["1.1em",0],translateX:["0.5em",0],translateZ:0,rotateZ:[-15,0],duration:1000,delay:anime.stagger(80)},'-=900');} return logo?2400:1500;
    }

    // --- Lógica da Transição Automática para Loja ---
    function iniciarTransicaoParaLoja(delayInicioFadeOut) { /* ...código transição ... */
        const tempoFadeOutTela = 800; const safeDelay = isNaN(delayInicioFadeOut) || delayInicioFadeOut < 1000 ? 3000 : delayInicioFadeOut; console.log(`Iniciando fade-out da Welcome Screen após ${safeDelay}ms`);
        if (welcomeScreen && headerElement && headerLogoElement && promoSection && announcementsDiv && mainElement && footerElement && btnAbrirCarrinho) { setTimeout(() => { welcomeScreen.classList.add('hidden'); setTimeout(() => { welcomeScreen.style.display = 'none'; headerElement.style.display = 'flex'; promoSection.style.display = ''; mainElement.style.display = ''; announcementsDiv.style.display = ''; footerElement.style.display = ''; btnAbrirCarrinho.style.display = 'flex'; requestAnimationFrame(() => { requestAnimationFrame(() => { headerElement.classList.add('visible'); promoSection.classList.add('visible'); mainElement.classList.add('visible'); announcementsDiv.classList.add('visible'); footerElement.classList.add('visible'); btnAbrirCarrinho.classList.add('visible'); }); }); anime({ targets: headerLogoElement, opacity: [0, 1], scale: [0.5, 1], duration: 800, easing: 'easeOutExpo', delay: 100 }); carregarConteudoExtra(); carregarProdutos(); }, tempoFadeOutTela); }, safeDelay);
        } else { console.error("Elementos essenciais não encontrados para transição."); if(welcomeScreen) welcomeScreen.style.display = 'none'; if(headerElement) { headerElement.style.display = 'flex'; headerElement.style.opacity = '1'; headerElement.style.visibility = 'visible';} if(headerLogoElement) { headerLogoElement.style.opacity = '1'; headerLogoElement.style.transform = 'scale(1)'; } if(promoSection) { promoSection.style.display=''; promoSection.style.opacity='1'; promoSection.style.visibility='visible';} if(mainElement) { mainElement.style.display = ''; mainElement.style.opacity = '1'; mainElement.style.visibility = 'visible';} if(announcementsDiv) { announcementsDiv.style.display=''; announcementsDiv.style.opacity='1'; announcementsDiv.style.visibility='visible';} if(footerElement) { footerElement.style.display = ''; footerElement.style.opacity = '1'; footerElement.style.visibility = 'visible';} if(btnAbrirCarrinho) { btnAbrirCarrinho.style.display = 'flex'; btnAbrirCarrinho.style.opacity = '1'; btnAbrirCarrinho.style.visibility = 'visible';} carregarConteudoExtra(); carregarProdutos(); }
    }

    // --- Carregar Conteúdo Extra (Promoções e Anúncios) ---
    async function carregarConteudoExtra() { /* ...código carregarConteudoExtra ... */
        if (!promoSection && !announcementsDiv) return; const adjustDelaysFallback = () => { if(headerElement) headerElement.style.transitionDelay = '0s'; if(mainElement) mainElement.style.transitionDelay = '0.1s'; if(footerElement) footerElement.style.transitionDelay = '0.3s'; if(btnAbrirCarrinho) btnAbrirCarrinho.style.transitionDelay = '0.4s'; };
        try { const response = await fetch('anuncios.json'); if (response.status === 404) { console.log("anuncios.json não encontrado."); if(promoSection) promoSection.style.display = 'none'; if(announcementsDiv) announcementsDiv.style.display = 'none'; adjustDelaysFallback(); return; } if (!response.ok) { throw new Error(`Erro HTTP: ${response.status}`); } conteudoExtra = await response.json(); exibirPromocoes(conteudoExtra.filter(item => item.ativo === true && item.tipo === 'promocao')); exibirAnunciosGerais(conteudoExtra.filter(item => item.ativo === true && item.tipo !== 'promocao')); } catch (error) { console.error("Erro ao carregar anuncios.json:", error); if(promoSection) promoSection.style.display = 'none'; if(announcementsDiv) announcementsDiv.style.display = 'none'; adjustDelaysFallback(); }
    }

    // --- Exibir Promoções (Topo - AGORA COMO CARROSSEL) ---
    function exibirPromocoes(promocoesAtivas) {
        if (!promoSection || !promoSwiperWrapper) { // Verifica se seção e wrapper existem
             console.error("Elemento da seção de promoção ou wrapper do Swiper não encontrado.");
             if(promoSection) promoSection.style.display = 'none'; // Esconde se wrapper não existe
             // Ajusta delays...
             if(headerElement) headerElement.style.transitionDelay = '0s'; if(mainElement) mainElement.style.transitionDelay = '0.1s'; if(announcementsDiv) announcementsDiv.style.transitionDelay = '0.3s'; if(footerElement) footerElement.style.transitionDelay = '0.5s'; if(btnAbrirCarrinho) btnAbrirCarrinho.style.transitionDelay = '0.6s';
             return;
         }
        promoSwiperWrapper.innerHTML = ''; // Limpa o wrapper

        if (promocoesAtivas.length > 0) {
            promoSection.style.display = ''; // Mostra a seção

            promocoesAtivas.forEach(promo => {
                const linkHref = promo.link_instagram;
                const Tag = linkHref ? 'a' : 'div'; // Usa <a> se tiver link

                // Cria o slide
                const slide = document.createElement('div');
                slide.className = 'swiper-slide'; // Classe essencial do Swiper

                // Cria o conteúdo interno do slide (reutilizando a ideia do promo-item)
                slide.innerHTML = `
                    <${Tag} class="promo-item-slide" ${linkHref ? `href="${linkHref}" target="_blank" rel="noopener noreferrer"` : ''}>
                        <img src="${promo.imagem || ''}" alt="${promo.titulo || 'Promoção'}">
                        <div class="promo-content">
                            <h3>${promo.titulo || ''}</h3>
                            <p>${promo.texto || ''}</p>
                        </div>
                    </${Tag}>`;
                promoSwiperWrapper.appendChild(slide); // Adiciona o slide ao wrapper
            });

            // Inicializa o Swiper DEPOIS que os slides foram adicionados e a seção está visível
             // Usamos um pequeno timeout ou requestAnimationFrame para garantir que o DOM atualizou
             requestAnimationFrame(() => {
                 // Destroi instância anterior se existir (para recarregar)
                 if (swiperPromo) {
                      swiperPromo.destroy(true, true);
                      swiperPromo = null;
                  }

                  // Só inicializa se tiver mais de 1 slide ou se quiser loop com 1 slide
                  if (promocoesAtivas.length > 0) {
                       swiperPromo = new Swiper('.promo-swiper', {
                            // Opções do Swiper
                            direction: 'horizontal', // 'vertical'
                            loop: promocoesAtivas.length > 1, // Loop só se tiver mais de 1 slide
                            autoplay: {
                                delay: 4000, // Tempo em ms para trocar slide
                                disableOnInteraction: false, // Continua autoplay após interação manual
                            },
                            pagination: {
                                el: '.swiper-pagination', // Elemento das bolinhas
                                clickable: true, // Permite clicar nas bolinhas
                            },
                            navigation: {
                                nextEl: '.swiper-button-next', // Elemento botão próxima
                                prevEl: '.swiper-button-prev', // Elemento botão anterior
                            },
                           grabCursor: true, // Mostra cursor "mãozinha"
                           effect: 'fade', // Efeito de transição (pode ser 'slide', 'fade', 'cube', 'coverflow', 'flip')
                           fadeEffect: {
                               crossFade: true
                           },
                       });
                  }
             });

             // Adiciona a classe visible para o fade-in da seção inteira
              requestAnimationFrame(() => { requestAnimationFrame(() => { promoSection.classList.add('visible'); }); });

        } else {
            promoSection.style.display = 'none';
            // Ajusta delays...
            if(headerElement) headerElement.style.transitionDelay = '0s'; if(mainElement) mainElement.style.transitionDelay = '0.1s'; if(announcementsDiv) announcementsDiv.style.transitionDelay = '0.3s'; if(footerElement) footerElement.style.transitionDelay = '0.5s'; if(btnAbrirCarrinho) btnAbrirCarrinho.style.transitionDelay = '0.6s';
        }
    }

    // --- Exibir Anúncios Gerais (Fim da Página) ---
    function exibirAnunciosGerais(anunciosAtivos) { /* ...código exibirAnunciosGerais (sem alterações)... */
        if (!announcementsDiv) return; announcementsDiv.innerHTML = '';
        if (anunciosAtivos.length > 0) { announcementsDiv.style.display = ''; if (!announcementsDiv.querySelector('h2')) { const h2 = document.createElement('h2'); h2.textContent = 'Fique por Dentro'; announcementsDiv.appendChild(h2); } const grid = document.createElement('div'); grid.className = 'announcements-grid'; anunciosAtivos.forEach(anuncio => { const item = document.createElement('div'); item.className = 'announcement-item'; let imgHTML = anuncio.imagem ? `<div class="announcement-image"><img src="${anuncio.imagem}" alt="${anuncio.titulo || 'Anúncio'}"></div>` : ''; let linkHTML = anuncio.link_instagram ? `<a href="${anuncio.link_instagram}" target="_blank" rel="noopener noreferrer">Ver Mais</a>` : ''; item.innerHTML = `${imgHTML}<div class="announcement-content"><h3>${anuncio.titulo || 'Novidade'}</h3><p>${anuncio.texto || ''}</p>${linkHTML}</div>`; grid.appendChild(item); }); announcementsDiv.appendChild(grid); requestAnimationFrame(() => { requestAnimationFrame(() => { announcementsDiv.classList.add('visible'); }); });
        } else { announcementsDiv.style.display = 'none'; if(footerElement) footerElement.style.transitionDelay = (promoSection.style.display === 'none' ? '0.3s' : '0.5s'); if(btnAbrirCarrinho) btnAbrirCarrinho.style.transitionDelay = (promoSection.style.display === 'none' ? '0.4s' : '0.6s'); }
    }

    // --- Carrega Produtos (com Skeleton Loader) ---
    async function carregarProdutos() { /* ...código carregar produtos ... */
        if (skeletonWrapper && !listaProdutosDiv.querySelector('.produto-card')) { skeletonWrapper.style.display = 'grid'; } else if (listaProdutosDiv && !listaProdutosDiv.querySelector('.produto-card') && !skeletonWrapper) { listaProdutosDiv.innerHTML = `<p style='text-align:center; padding: 40px; font-size: 1.2em; color: var(--cor-texto-secundario);'>Carregando produtos...</p>`; }
        try { const response = await fetch('products.json'); if (!response.ok) { throw new Error(`Erro HTTP: ${response.status}`); } produtos = await response.json(); console.log("Produtos carregados:", produtos); exibirProdutos(); } catch (error) { console.error("Erro ao carregar products.json:", error); if (listaProdutosDiv) { listaProdutosDiv.innerHTML = `<p style='text-align:center; padding: 40px; font-size: 1.2em; color: var(--cor-erro);'>Erro ao carregar produtos.<br>Verifique o console (F12).</p>`; } if (skeletonWrapper) skeletonWrapper.style.display = 'none'; }
    }

    // --- Exibir Produtos (Esconde Skeleton) ---
    function exibirProdutos() { /* ...código exibir produtos ... */
        if (!listaProdutosDiv) return; if (skeletonWrapper) skeletonWrapper.style.display = 'none'; listaProdutosDiv.innerHTML = ''; if (!produtos || produtos.length === 0) { listaProdutosDiv.innerHTML = `<p style='text-align:center; padding: 40px; font-size: 1.2em; color: var(--cor-texto-secundario);'>Nenhum produto cadastrado.</p>`; return; }
        produtos.forEach(produto => { const card = document.createElement('div'); card.className = 'produto-card'; card.setAttribute('data-id', produto.id); const precoNum = parseFloat(produto.preco); const precoFmt = !isNaN(precoNum) ? precoNum.toFixed(2).replace('.', ',') : '---'; const img = produto.imagem ? produto.imagem : ''; card.innerHTML = `${img ? `<img src="${img}" alt="${produto.nome||'Produto'}" class="produto-imagem" loading="lazy">`:'<div class="imagem-placeholder">Sem Imagem</div>'} <div class="produto-info"> <div> <h3 class="produto-nome">${produto.nome||'Produto s/ nome'}</h3> <p class="produto-descricao">${produto.descricao||''}</p> </div> <div> <p class="produto-preco">R$ ${precoFmt}</p> <button class="btn-adicionar" data-id="${produto.id}"> Adicionar </button> </div> </div>`; listaProdutosDiv.appendChild(card); }); adicionarListenersBotoesAdicionar();
    }

    // --- Listeners Botão Adicionar ---
    function adicionarListenersBotoesAdicionar() { /* ...código listeners botão adicionar ... */ document.querySelectorAll('.btn-adicionar').forEach(b => { const cl=b.cloneNode(true); b.parentNode.replaceChild(cl,b); cl.addEventListener('click',(e)=>{ const id=e.target.getAttribute('data-id'); adicionarAoCarrinho(id); e.target.style.transform='scale(0.95)'; e.target.style.transition='transform 0.1s ease-out'; setTimeout(()=>{e.target.style.transform='scale(1)';},100); }); }); }

    // --- Lógica do Carrinho ---
    function adicionarAoCarrinho(id){/* ...código adicionar carrinho ... */ const p=produtos.find(p=>p.id===id);if(!p)return; const i=carrinho.find(i=>i.id===id);if(i)i.quantidade++;else{const n=parseFloat(p.preco);if(isNaN(n))return;carrinho.push({id:p.id,nome:p.nome,preco:n,quantidade:1});}atualizarCarrinhoVisual();salvarCarrinhoLocalStorage();}
    function removerDoCarrinho(id){/* ...código remover carrinho ... */ const idx=carrinho.findIndex(i=>i.id===id);if(idx>-1){carrinho.splice(idx,1);atualizarCarrinhoVisual();salvarCarrinhoLocalStorage();}}
    function atualizarCarrinhoVisual(){/* ...código atualizar visual carrinho ... */ if(!itensCarrinhoUl||!totalCarrinhoSpan||!contadorCarrinhoSpan||!carrinhoVazioMsg||!btnFinalizarCompra)return;itensCarrinhoUl.innerHTML='';let t=0;let c=0;if(carrinho.length===0){carrinhoVazioMsg.style.display='list-item';btnFinalizarCompra.disabled=true;}else{carrinhoVazioMsg.style.display='none';btnFinalizarCompra.disabled=false;carrinho.forEach(item=>{const li=document.createElement('li');const p=parseFloat(item.preco);const q=parseInt(item.quantidade,10);if(!isNaN(p)&&!isNaN(q)){const subt=p*q;t+=subt;c+=q;li.innerHTML=`<span class="carrinho-item-info">${q}x ${item.nome}</span> <span class="carrinho-item-preco">R$ ${subt.toFixed(2).replace('.',',')}</span> <button class="btn-remover-item" data-id="${item.id}" title="Remover Item">🗑️</button>`;itensCarrinhoUl.appendChild(li);}});adicionarListenersBotoesRemover();}totalCarrinhoSpan.textContent=t.toFixed(2).replace('.',',');contadorCarrinhoSpan.textContent=c;}
    function adicionarListenersBotoesRemover(){/* ...código listeners botão remover ... */ document.querySelectorAll('.btn-remover-item').forEach(b=>{const cl=b.cloneNode(true);b.parentNode.replaceChild(cl,b);cl.addEventListener('click',(e)=>{const id=e.target.closest('button').getAttribute('data-id');removerDoCarrinho(id);});});}

    // --- Abrir e Fechar Carrinho ---
    if (btnAbrirCarrinho && carrinhoSection) btnAbrirCarrinho.addEventListener('click', () => carrinhoSection.classList.add('aberto'));
    if (btnFecharCarrinho && carrinhoSection) btnFecharCarrinho.addEventListener('click', () => carrinhoSection.classList.remove('aberto'));

    // --- Finalizar Compra (WhatsApp) ---
    if (btnFinalizarCompra) { btnFinalizarCompra.addEventListener('click', () => { /* ...código WhatsApp ... */ if(carrinho.length===0)return; let msg=`Olá, Tammy's Store! 👋 Pedido:\n\n`;let total=0;carrinho.forEach(i=>{const s=parseFloat(i.preco)*parseInt(i.quantidade,10);if(!isNaN(s)){msg+=`*${i.quantidade}x* ${i.nome}\n_(Subtotal: R$ ${s.toFixed(2).replace('.',',')})_\n\n`;total+=s;}});msg+=`*Total: R$ ${total.toFixed(2).replace('.',',')}*\n\nAguardando validação e PIX. 😊`; const num='5511975938366'; if(num.length<12||!/^\d+$/.test(num)){alert("Erro: Número WhatsApp inválido.");console.error("Número WhatsApp inválido:", num);return;}const link=`https://wa.me/${num}?text=${encodeURIComponent(msg)}`;console.log("Abrindo WhatsApp link:", link);window.open(link,'_blank');});}

     // --- Persistência do Carrinho ---
     function salvarCarrinhoLocalStorage() { /* ...código salvar carrinho ... */ try { localStorage.setItem('carrinhoTammyStore', JSON.stringify(carrinho)); } catch (e) { console.error("Erro salvar carrinho:", e); } }
     function carregarCarrinhoLocalStorage() { /* ...código carregar carrinho ... */ try { const c = localStorage.getItem('carrinhoTammyStore'); carrinho = c ? JSON.parse(c) : []; } catch (e) { console.error("Erro carregar carrinho:", e); carrinho = []; } }

    // --- Inicialização ---
    const duracaoEstimada = iniciarAnimacaoBoasVindas();
    const tempoPausa = 1000;
     setTimeout(() => { const delayReal = duracaoAnimacaoEntrada > 100 ? duracaoAnimacaoEntrada : duracaoEstimada; iniciarTransicaoParaLoja(delayReal + tempoPausa); }, 50);
    carregarCarrinhoLocalStorage();
    atualizarCarrinhoVisual();
    // Conteúdo extra e produtos são carregados dentro de iniciarTransicaoParaLoja

}); // Fim do DOMContentLoaded