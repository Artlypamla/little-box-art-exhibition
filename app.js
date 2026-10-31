(() => {
  'use strict';
  const stage = document.querySelector('#open-art');
  const paper = stage.querySelector('.art-paper');
  const packageView = stage.querySelector('.hero-package');
  const artDialog = document.querySelector('#art-dialog');
  const infoDialog = document.querySelector('#info-dialog');
  const viewNames = {full:'完整画作', detail:'蜡笔与舷窗细节', package:'点心礼盒应用'};
  let view = 'full';
  let returnFocus = null;
  let toastTimer;
  function notify(message) {
    const toast=document.querySelector('#toast');
    toast.textContent=message;
    toast.hidden=false;
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>toast.hidden=true,5000);
  }
  function showDialog(dialog, trigger) {
    returnFocus = trigger;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    dialog.querySelector('[data-close]').focus();
  }
  document.querySelectorAll('[data-view]').forEach(button => {
    button.addEventListener('click', () => {
      view = button.dataset.view;
      document.querySelectorAll('[data-view]').forEach(item => item.setAttribute('aria-pressed',String(item===button)));
      stage.classList.toggle('detail',view === 'detail');
      paper.hidden = view === 'package';
      stage.querySelector('.paper-behind').hidden = view === 'package';
      packageView.hidden = view !== 'package';
      stage.setAttribute('aria-label',`放大查看${viewNames[view]}`);
      document.querySelector('#art-caption-text').textContent = view === 'package' ? '点心礼盒 · 包装概念示意' : view === 'detail' ? '局部细节 · 点击查看完整原作' : '样例画作 · 作品名与署名均为演示内容';
      document.querySelector('#view-status').textContent = `已切换到${viewNames[view]}`;
    });
  });
  stage.addEventListener('click', () => {
    const isPackage = view === 'package';
    document.querySelector('#zoom-title').textContent = isPackage ? '点心礼盒 · 包装概念' : '向星星出发 · 完整画作';
    const art = artDialog.querySelector('.zoom-content > img');
    const pack = document.querySelector('#package-zoom');
    art.hidden = isPackage;
    pack.hidden = !isPackage;
    if (isPackage && !pack.firstElementChild) pack.appendChild(stage.querySelector('.mini-gift').cloneNode(true));
    showDialog(artDialog,stage);
  });
  const content = {
    products:{title:'认识公益联名产品',body:'<div class="example-product"><img src="assets/artwork.jpg" alt="蓝色火箭样例画作"><div><strong>盒子里的小小画展 · 点心礼盒</strong><small>课程概念产品，未上市</small></div></div><p>这款概念礼盒将艺术作品应用于可拆卸纸封套，并通过二维码连接线上画展，让消费者认识完整作品、创作者与公益合作。</p><h3>一份产品，如何支持创作？</h3><p>爱分你连接有社会责任心的企业与品牌，通过作品与产品联名，为设计带来艺术表达，并使产品销售利润回流，支持孤独症艺术伙伴的持续创作和生产生活。</p><p class="caption">本页没有真实产品链接或购买服务。具体产品、合作与支持安排待项目方确认后展示；二期将补充联名产品介绍及官方渠道。</p>'},
    future:{title:'下一站，让作品走进日常',body:'<p>二期计划加入联名产品介绍：展示完整包装、产品信息，以及它与画作的联系。</p><p>还会提供经确认的官方渠道，让感兴趣的人继续了解项目。目前尚未接入官方链接。</p><p class="caption">本期只展示扩展方向，不跳转到虚构店铺，不收集个人信息。</p>'}
  };
  document.querySelectorAll('[data-dialog]').forEach(button => button.addEventListener('click', () => {
    const item = content[button.dataset.dialog];
    document.querySelector('#info-title').textContent=item.title;
    document.querySelector('#info-body').innerHTML=item.body;
    showDialog(infoDialog,button);
  }));
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('close', () => {
      document.body.style.overflow='';
      returnFocus?.focus({preventScroll:true});
    });
    dialog.addEventListener('click',event => {
      if(event.target!==dialog) return;
      const r=dialog.getBoundingClientRect();
      if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) dialog.close();
    });
  });
  document.querySelector('#story-toggle').addEventListener('click',function(){
    const expanded=this.getAttribute('aria-expanded')==='true';
    this.setAttribute('aria-expanded',String(!expanded));
    document.querySelector('#more-story').hidden=expanded;
    this.innerHTML=expanded?'读一小段作品故事 <span aria-hidden="true">＋</span>':'收起作品故事 <span aria-hidden="true">−</span>';
  });
  document.querySelector('#finish').addEventListener('click',function(){
    if(this.dataset.completed==='true') {
      document.querySelector('#gallery').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
      stage.focus({preventScroll:true});
      return;
    }
    this.dataset.completed='true';
    this.innerHTML='再欣赏一次画作 <svg class="icon" aria-hidden="true"><use href="#zoom"/></svg>';
    document.querySelector('#completion-label').textContent='观展完成';
    document.querySelector('#completion-copy').textContent='你已欣赏作品，并了解它如何走进点心包装，以及爱分你如何通过艺术与产品合作支持持续创作。';
    notify('观展完成，谢谢你的停留。');
  });
  document.querySelector('#share-product').addEventListener('click',()=>{
    notify('分享入口已预留，产品链接接入后即可使用。');
  });
})();
