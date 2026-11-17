'use strict';
const $ = id => document.getElementById(id);
const fields = {
  name: ['Họ và tên', 'Đỗ Ngọc Nam Phương'],
  birth: ['Ngày sinh', '20/10/2008'],
  company: ['Đại đội', 'Đại đội 26'],
  student: ['Mã sinh viên', '2671720025'],
  passwordMask: ['Mật khẩu', '******'],
  phone: ['Điện thoại', ''],
  room: ['Số phòng', 'B5.312'],
  leader: ['Người phụ trách', 'Trần Tiến Dũng'],
  leaderPhone: ['Điện thoại người phụ trách', '0964669559'],
  height: ['Chiều cao', '168'], weight: ['Cân nặng', '60'], waist: ['Chu vi lưng quần', '73']
};
const initialMessage = {
  stamp: '14/11/2026 11:29:51',
  body: [
    'Lý do: Em xin phép được ra về 01 ngày để viếng và di dời phần mộ của ông ngoại.',
    'Đăng ký ra: 14/11/2026 16:30:00',
    'Được phép ra: 14/11/2026 16:30:00',
    'Thực tế ra: Chưa xác định',
    'Đăng ký vào: 15/11/2026 20:30:00',
    'Được phép vào: 15/11/2026 20:30:00',
    'Thực tế vào: Chưa xác định',
    'Trạng thái: CHP duyệt'
  ].join('\n')
};
const storageKey = 'QLSV.local.v1';
let statusTimeout;
function notify(message) {
  $('status').textContent = message;
  clearTimeout(statusTimeout);
  statusTimeout = setTimeout(() => $('status').textContent = '', 3000);
}
function load() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(storageKey)) || {}; }
  catch { notify('Không thể đọc dữ liệu đã lưu trên thiết bị.'); }
  const profile = {};
  for (const [key, [, fallback]] of Object.entries(fields)) {
    profile[key] = typeof saved.profile?.[key] === 'string' ? saved.profile[key] : fallback;
  }
  const messages = Array.isArray(saved.messages) ? saved.messages.filter(
    m => typeof m?.stamp === 'string' && typeof m?.body === 'string') : [initialMessage];
  const photo = typeof saved.photo === 'string' && saved.photo.startsWith('data:image/jpeg;base64,') ? saved.photo : '';
  return {profile, messages, photo};
}
let state = load();
function save(next) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(next));
    state = next;
    return true;
  } catch {
    notify('Lưu thất bại. Vui lòng kiểm tra bộ nhớ của trình duyệt.');
    return false;
  }
}
function changeProfile(key, value) {
  return save({...state, profile: {...state.profile, [key]: value}});
}
const pencil = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M13 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-8"/><path d="m9 17 1-4L19 4l3 3-9 9zM17.5 5.5l3 3"/></svg>';
for (const key of ['company','student','passwordMask','birth','phone','room']) {
  const row = document.createElement('button');
  row.className = 'row';
  row.dataset.edit = key;
  const label = document.createElement('span');
  label.textContent = fields[key][0];
  const value = document.createElement('span');
  value.dataset.value = key;
  row.append(label, value);
  if (['passwordMask','phone'].includes(key)) {
    const editIcon = document.createElement('span');
    editIcon.className = 'pencil';
    editIcon.innerHTML = pencil;
    row.append(editIcon);
  }
  $('rows').append(row);
}
function renderProfile() {
  document.querySelectorAll('[data-value]').forEach(el => el.textContent = state.profile[el.dataset.value]);
  document.querySelectorAll('[data-input]').forEach(el => el.value = state.profile[el.dataset.input]);
  $('portrait').src = state.photo || 'assets/portrait.png';
}
const titles = {profile:'Hồ sơ cá nhân', absence:'Quản lý học tập', gate:'Đơn ra vào cổng'};
let page = 'home';
function renderRoute() {
  lastTap = null;
  const key = location.hash.slice(1);
  const previous = page;
  page = Object.hasOwn(titles,key) ? key : 'home';
  const away = page !== 'home';
  document.querySelector('meta[name="theme-color"]').content = away ? '#ffffff' : '#f2f2f2';
  $('phone').classList.toggle('open', away);
  $('home').inert = away;
  $('details').inert = !away;
  $('title').textContent = titles[page] || '';
  Object.keys(titles).forEach(p => $(p).hidden = p !== page);
  $('scroll').scrollTop = 0;
  if (away) $('back').focus({preventScroll:true});
  else if (previous !== 'home') document.querySelector('.home [data-page="'+previous+'"]')?.focus({preventScroll:true});
}
function goHome() {
  if (history.state?.qlsv) history.back();
  else { history.replaceState(null,'',location.pathname + location.search); renderRoute(); }
}
document.querySelectorAll('[data-page]').forEach(el => el.onclick = () => {
  history.pushState({qlsv:true},'', '#'+el.dataset.page);
  renderRoute();
  if (el.hasAttribute('data-measurements')) $('scroll').scrollTop = $('measure').offsetTop;
});
$('back').onclick = goHome;
$('signout').onclick = goHome;
window.addEventListener('popstate',renderRoute);
window.addEventListener('hashchange',renderRoute);

let submitEdit;
function openEditor(title, specs, submit) {
  $('deleteMessage').hidden = true;
  $('deleteMessage').onclick = null;
  $('editTitle').textContent = title;
  $('editFields').replaceChildren();
  for (const spec of specs) {
    const label = document.createElement('label');
    label.textContent = spec.label;
    const input = document.createElement(spec.multiline ? 'textarea' : 'input');
    if (spec.multiline) input.rows = 10;
    input.name = spec.name;
    input.value = spec.value;
    if (spec.numeric) { input.type = 'number'; input.min = 0; input.max = 80; }
    label.append(input);
    $('editFields').append(label);
  }
  submitEdit = submit;
  $('editor').showModal();
}
$('editor').setAttribute('aria-labelledby','editTitle');
$('editorForm').onsubmit = event => {
  event.preventDefault();
  if (submitEdit(Object.fromEntries(new FormData(event.target)))) {
    $('editor').close();
    notify('Đã lưu trên thiết bị');
  }
};
$('cancel').onclick = () => $('editor').close();
document.querySelectorAll('[data-edit]').forEach(el => el.onclick = () => {
  const key = el.dataset.edit;
  const isMask = key === 'passwordMask';
  openEditor(fields[key][0], [{
    name:'value', label:isMask ? 'Số ký tự che mật khẩu' : fields[key][0],
    value:isMask ? state.profile[key].length : state.profile[key], numeric:isMask
  }], ({value}) => {
    if (!changeProfile(key,isMask ? '*'.repeat(Number(value)) : value)) return false;
    renderProfile();
    return true;
  });
});
document.querySelectorAll('[data-input]').forEach(el => el.oninput = () => changeProfile(el.dataset.input,el.value));
$('update').onclick = () => {
  const profile = {...state.profile};
  document.querySelectorAll('[data-input]').forEach(el => profile[el.dataset.input] = el.value);
  if (save({...state,profile})) notify('Đã lưu trên thiết bị');
};
$('portraitButton').onclick = () => $('photoFile').click();
$('photoFile').onchange = async event => {
  const file = event.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const side = Math.min(image.width,image.height);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 384;
    canvas.getContext('2d').drawImage(image,(image.width-side)/2,(image.height-side)/2,side,side,0,0,384,384);
    if (save({...state,photo:canvas.toDataURL('image/jpeg',.85)})) {
      renderProfile(); notify('Đã lưu trên thiết bị');
    }
  } catch { notify('Không thể đọc tệp ảnh này.'); }
  finally { URL.revokeObjectURL(url); event.target.value = ''; }
};

function editMessage(index) {
  const existing = state.messages[index];
  const m = existing || {stamp:new Date().toLocaleString('vi-VN'),body:'Lý do: \nTrạng thái: Bản nháp'};
  openEditor(existing ? 'Chỉnh sửa đơn' : 'Tạo đơn', [
    {name:'stamp',label:'Thời gian',value:m.stamp},
    {name:'body',label:'Nội dung',value:m.body,multiline:true}
  ], ({stamp,body}) => {
    const messages = [...state.messages];
    messages[index] = {stamp,body};
    if (!save({...state,messages})) return false;
    renderMessages();
    return true;
  });
  if (existing) {
    const remove = $('deleteMessage');
    remove.hidden = false;
    remove.textContent = 'Xóa đơn';
    let confirming = false;
    remove.onclick = () => {
      if (!confirming) {
        confirming = true;
        remove.textContent = 'Xác nhận xóa';
        return;
      }
      const messages = state.messages.filter((_, i) => i !== index);
      if (!save({...state,messages})) return;
      $('editor').close();
      renderMessages();
      $('create').focus({preventScroll:true});
      notify('Đã xóa đơn');
    };
  }
}
let lastTap = null;
function renderMessages() {
  $('messages').replaceChildren();
  state.messages.forEach((m,index) => {
    const bubble = document.createElement('button');
    bubble.className = 'bubble';
    bubble.title = 'Chạm hai lần để chỉnh sửa';
    bubble.dataset.index = index;
    const sample = document.createElement('span');
    sample.className = 'sample';
    sample.textContent = 'Mẫu';
    bubble.append(sample);
    for (const part of ['stamp','body']) {
      const span = document.createElement('span');
      span.className = part;
      span.textContent = m[part];
      bubble.append(span);
    }
    bubble.onclick = event => {
      const now = performance.now();
      const doubleTap = lastTap?.bubble === bubble && now - lastTap.time <= 450
        && Math.hypot(event.clientX - lastTap.x, event.clientY - lastTap.y) <= 32;
      if (event.detail === 0 || doubleTap) {
        lastTap = null;
        editMessage(index);
      } else {
        lastTap = {bubble, time: now, x: event.clientX, y: event.clientY};
      }
    };
    $('messages').append(bubble);
  });
}
$('create').onclick = () => editMessage(state.messages.length);
renderProfile();
renderMessages();
renderRoute();
