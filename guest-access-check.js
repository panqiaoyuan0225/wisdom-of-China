(function() {
    const GUEST_ALLOWED_PAGES = ['book.html', 'original.html'];
    
    function checkGuestAccess() {
        const isGuest = sessionStorage.getItem('isGuest') === 'true';
        if (!isGuest) return;
        
        const currentPage = window.location.pathname.split('/').pop();
        const isAllowed = GUEST_ALLOWED_PAGES.some(page => currentPage.includes(page));
        
        if (!isAllowed) {
            document.body.innerHTML = `
                <div style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f5f5dc 0%, #e8e4c9 100%);
                    font-family: 'Microsoft YaHei', 'SimSun', sans-serif;
                    padding: 20px;
                ">
                    <div style="
                        background: white;
                        border-radius: 20px;
                        padding: 50px 40px;
                        box-shadow: 0 10px 40px rgba(139, 69, 19, 0.15);
                        text-align: center;
                        max-width: 500px;
                        width: 100%;
                    ">
                        <div style="font-size: 4rem; margin-bottom: 20px;">🔒</div>
                        <h2 style="color: #8b4513; margin-bottom: 15px; font-size: 1.8rem;">游客模式无法访问</h2>
                        <p style="color: #666; margin-bottom: 30px; line-height: 1.6;">
                            此功能需要登录账号<br>
                            游客仅可使用「名著阅读」和「原文阅读」功能
                        </p>
                        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                            <a href="index.html" style="
                                padding: 12px 30px;
                                background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
                                color: white;
                                border-radius: 10px;
                                text-decoration: none;
                                font-weight: bold;
                                transition: all 0.3s;
                                box-shadow: 0 4px 15px rgba(139, 69, 19, 0.3);
                            ">前往登录</a>
                            <a href="home.html" style="
                                padding: 12px 30px;
                                background: linear-gradient(135deg, #7CB342 0%, #5C6BC0 100%);
                                color: white;
                                border-radius: 10px;
                                text-decoration: none;
                                font-weight: bold;
                                transition: all 0.3s;
                                box-shadow: 0 4px 15px rgba(124, 179, 66, 0.3);
                            ">返回首页</a>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkGuestAccess);
    } else {
        checkGuestAccess();
    }
})();
