// public/app.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Khai báo biến DOM ---
    // (Giữ nguyên các biến DOM cũ)
    const achievementImageUrlHidden = document.getElementById('achievement-image-url-hidden');
    const achievementImageFile = document.getElementById('achievement-image-file');
    const imagePreview = document.getElementById('image-preview');
    const submitAchievementBtn = document.getElementById('submit-achievement-btn');
    const notificationToast = document.getElementById('notification-toast');

    let appState = { achievements: [], messages: [] };

    // --- Hàm Helper ---
    const showNotification = (message, isError = false) => {
        notificationToast.innerHTML = `<div class="p-4 rounded-lg shadow-lg ${isError ? 'bg-red-500' : 'bg-green-500'} text-white">${message}</div>`;
        setTimeout(() => notificationToast.innerHTML = '', 3000);
    };

    const clearAchievementForm = () => {
        achievementForm.reset();
        achievementIdInput.value = '';
        achievementImageUrlHidden.value = '';
        imagePreview.src = '';
        imagePreview.classList.add('hidden');
    };
    
    // --- Hàm API ---
    const loadData = async () => { /* Giữ nguyên hàm cũ */ };
    const saveData = async (showSuccess = true) => { /* Sửa đổi một chút */ 
        try {
            const res = await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(appState) });
            if (!res.ok) throw new Error('Failed to save data');
            if(showSuccess) showNotification('Lưu thay đổi thành công!');
        } catch (error) {
            console.error("Could not save data.", error);
            showNotification('Lỗi: Không thể lưu dữ liệu.', true);
        }
    };

    // --- Hàm Render ---
    const renderAchievements = () => {
        achievementsListPublic.innerHTML = ''; achievementsListAdmin.innerHTML = '';
        if (!appState.achievements || appState.achievements.length === 0) {
            const p = '<div class="col-span-full text-center py-8">Chưa có thành tích nào.</div>';
            achievementsListPublic.innerHTML = p; achievementsListAdmin.innerHTML = p; return;
        }
        appState.achievements.forEach(ach => {
            const url = ach.imageUrl; // Thay đổi ở đây
            achievementsListPublic.innerHTML += `<div class="card-style ..."><img src="${url}" ...></div>`; // Dùng ach.imageUrl
            achievementsListAdmin.innerHTML += `<div class="flex ..."><img src="${url}" ...><button data-id="${ach.id}" ...></div>`; // Dùng ach.imageUrl
        });
    };
    const renderMessages = () => { /* Giữ nguyên hàm cũ */ };
    const renderAll = () => { renderAchievements(); renderMessages(); };

    // --- Xử lý Routing & Auth ---
    // (Giữ nguyên các hàm checkRoute, handleLogin, handleLogout)
    
    // --- XỬ LÝ SỰ KIỆN MỚI ---
    achievementImageFile.addEventListener('change', () => {
        const file = achievementImageFile.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    achievementForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = achievementImageFile.files[0];
        const id = parseInt(achievementIdInput.value);
        
        // Bắt buộc phải có ảnh khi tạo mới
        if (!id && !file) {
            alert('Vui lòng chọn một ảnh cho thành tích mới.');
            return;
        }

        submitAchievementBtn.disabled = true;
        submitAchievementBtn.textContent = 'Đang xử lý...';

        try {
            let imageUrl = achievementImageUrlHidden.value;

            // Nếu có file mới, upload file đó
            if (file) {
                const response = await fetch(`/api/upload?filename=${file.name}`, {
                    method: 'POST',
                    body: file,
                });
                const newBlob = await response.json();
                imageUrl = newBlob.url;
            }

            const achievementData = {
                title: achievementTitleInput.value,
                description: achievementDescriptionInput.value,
                imageUrl: imageUrl // Thay đổi ở đây
            };

            if (id) {
                const index = appState.achievements.findIndex(a => a.id === id);
                if (index > -1) appState.achievements[index] = { ...achievementData, id: id };
            } else {
                appState.achievements.unshift({ ...achievementData, id: Date.now() });
            }

            await saveData();
            renderAchievements();
            clearAchievementForm();
        } catch (error) {
            console.error("Error submitting achievement:", error);
            showNotification('Đã xảy ra lỗi khi lưu.', true);
        } finally {
            submitAchievementBtn.disabled = false;
            submitAchievementBtn.textContent = 'Lưu Thành tích';
        }
    });

    clearFormBtn.addEventListener('click', clearAchievementForm);
    
    achievementsListAdmin.addEventListener('click', e => {
        const target = e.target.closest('button'); if (!target) return;
        const id = parseInt(target.dataset.id);
        if (target.classList.contains('delete-btn')) { /* Logic xóa giữ nguyên */ }
        
        if (target.classList.contains('edit-btn')) {
            const ach = appState.achievements.find(a => a.id === id);
            if (ach) {
                achievementIdInput.value = ach.id;
                achievementTitleInput.value = ach.title;
                achievementDescriptionInput.value = ach.description;
                achievementImageUrlHidden.value = ach.imageUrl; // Dùng ô ẩn
                imagePreview.src = ach.imageUrl; // Hiển thị ảnh hiện tại
                imagePreview.classList.remove('hidden');
                window.scrollTo(0,0);
            }
        }
    });

    // --- Gắn các Event Listener còn lại ---
    // (Giữ nguyên các hàm messagesListAdmin, messageForm, adminTabBtns, loginForm, ...)

    // --- Khởi chạy ---
    checkRoute();
});
