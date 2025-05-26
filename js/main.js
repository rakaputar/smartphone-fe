const BASE_URL = 'http://localhost:5000/api';

// Proteksi halaman: cek token login
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

// Logout button
document.getElementById('btnLogout').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});

// Fungsi fetch dengan auth header
function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }  
  options.headers = options.headers || {};
  options.headers['Authorization'] = 'Bearer ' + token;
  return fetch(url, options);
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderSmartphones(data) {
  const container = document.getElementById('smartphoneList');
  container.innerHTML = '';

  if (!data.length) {
    container.innerHTML = '<p>Tidak ada data smartphone.</p>';
    return;
  }

  data.forEach(sp => {
    const card = document.createElement('div');
    card.className = 'col';

    const safeSpecs = escapeHtml(sp.specs).replace(/\n/g, '<br>');

    const formattedPrice = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(sp.price);

    card.innerHTML = `
      <div class="card h-100 d-flex flex-column">
        <img src="${sp.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}" class="card-img-top" alt="${sp.name}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${sp.name}</h5>
          <p class="card-text flex-grow-1">${safeSpecs}</p>
          
          <div class="mt-auto">
            <p class="card-text mb-1 fw-bold fs-5 text-success">Harga: ${formattedPrice}</p>
            <p class="card-text mb-2"><strong>Brand:</strong> ${sp.Brand ? sp.Brand.name : 'Unknown'}</p>

            <div class="d-flex justify-content-end gap-2">
              <a href="edit.html?id=${sp.id}" class="btn btn-sm btn-outline-dark" title="Edit">
                <i class="bi bi-pencil-square"></i>
              </a>
              <button class="btn btn-sm btn-outline-danger" title="Hapus" onclick="deleteSmartphone(${sp.id})">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}





async function loadSmartphones() {
  const res = await fetchWithAuth('http://localhost:5000/api/smartphones');
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
    return;
  }
  const data = await res.json();
  renderSmartphones(data);
}


async function deleteSmartphone(id) {
  if (!confirm('Yakin ingin menghapus smartphone ini?')) return;

  const res = await fetchWithAuth(`http://localhost:5000/api/smartphones/${id}`, {
    method: 'DELETE',
  });

  if (res.ok) {
    alert('Berhasil dihapus');
    loadSmartphones();
  } else {
    alert('Gagal menghapus');
  }
}

loadSmartphones();
