(function(){
  // Navigation : fond au défilement + menu mobile
  var nav = document.querySelector('.nav');
  function onScroll(){ if(nav) nav.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  var burger = document.querySelector('.burger');
  if(burger){
    burger.addEventListener('click', function(){
      var open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.mobile-menu a').forEach(function(a){
      a.addEventListener('click', function(){ document.body.classList.remove('menu-open'); });
    });
  }

  // Apparitions au défilement
  var els = document.querySelectorAll('.sr, .sr-img');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('sr-visible'); io.unobserve(e.target); }
      });
    }, {threshold:.12, rootMargin:'0px 0px -40px 0px'});
    els.forEach(function(el){ io.observe(el); });
  } else { els.forEach(function(el){ el.classList.add('sr-visible'); }); }

  // Visionneuse photos (pages prestations)
  var figs = Array.prototype.slice.call(document.querySelectorAll('.masonry figure'));
  if(figs.length){
    var lb = document.createElement('div');
    lb.className = 'lb';
    lb.setAttribute('role','dialog');
    lb.setAttribute('aria-label','Visionneuse de photos');
    lb.innerHTML = '<img alt=""><button class="x" aria-label="Fermer">✕</button><button class="prev" aria-label="Photo précédente">←</button><button class="next" aria-label="Photo suivante">→</button><div class="count"></div>';
    document.body.appendChild(lb);
    var img = lb.querySelector('img'), count = lb.querySelector('.count'), idx = 0;
    function show(i){
      idx = (i + figs.length) % figs.length;
      var src = figs[idx].querySelector('img');
      img.src = src.getAttribute('src'); img.alt = src.alt;
      count.textContent = (idx + 1) + ' / ' + figs.length;
    }
    function close(){ lb.classList.remove('open'); document.body.style.overflow = ''; }
    figs.forEach(function(f, i){
      f.setAttribute('tabindex','0');
      f.addEventListener('click', function(){ show(i); lb.classList.add('open'); document.body.style.overflow = 'hidden'; });
      f.addEventListener('keydown', function(e){ if(e.key === 'Enter'){ f.click(); } });
    });
    lb.querySelector('.x').addEventListener('click', close);
    lb.querySelector('.prev').addEventListener('click', function(e){ e.stopPropagation(); show(idx - 1); });
    lb.querySelector('.next').addEventListener('click', function(e){ e.stopPropagation(); show(idx + 1); });
    lb.addEventListener('click', function(e){ if(e.target === lb) close(); });
    document.addEventListener('keydown', function(e){
      if(!lb.classList.contains('open')) return;
      if(e.key === 'Escape') close();
      if(e.key === 'ArrowLeft') show(idx - 1);
      if(e.key === 'ArrowRight') show(idx + 1);
    });
    var sx = null;
    lb.addEventListener('touchstart', function(e){ sx = e.touches[0].clientX; }, {passive:true});
    lb.addEventListener('touchend', function(e){
      if(sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if(Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }

  // Formulaire de demande : présélection du type d'événement (?type=mariage)
  var form = document.getElementById('demande');
  if(form){
    var params = new URLSearchParams(window.location.search);
    var t = params.get('type');
    var select = form.querySelector('select[name="Type d\'événement"]');
    if(t && select){
      Array.prototype.forEach.call(select.options, function(o){ if(o.dataset.key === t) select.value = o.value; });
    }

    var msg = form.querySelector('.form-msg');
    var btn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function(e){
      if(!window.fetch) return; // envoi classique si navigateur ancien
      e.preventDefault();
      if(!form.checkValidity()){ form.reportValidity(); return; }
      btn.disabled = true; btn.textContent = 'Envoi en cours…';
      msg.className = 'form-msg';
      var data = {};
      new FormData(form).forEach(function(v, k){ data[k] = v; });
      fetch(form.getAttribute('data-ajax'), {
        method:'POST',
        headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify(data)
      }).then(function(r){ return r.json().then(function(j){ return {ok:r.ok, j:j}; }); })
        .then(function(res){
          if(res.ok && (res.j.success === true || res.j.success === 'true')){
            form.reset();
            msg.className = 'form-msg ok';
            msg.textContent = 'Merci ! Votre demande a bien été envoyée. L’équipe KBSL Events vous recontacte très vite.';
          } else { throw new Error(); }
        })
        .catch(function(){
          msg.className = 'form-msg err';
          msg.innerHTML = 'L’envoi n’a pas abouti. Réessayez ou écrivez-nous directement sur <a href="https://wa.me/243821496430" target="_blank" rel="noopener" style="text-decoration:underline">WhatsApp</a>.';
        })
        .then(function(){ btn.disabled = false; btn.textContent = 'Envoyer ma demande'; });
    });
  }
})();
