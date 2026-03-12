<template>
    <aside class="sidebar">
      <div class="logo-section">
        <img src="@/assets/logo.png" alt="뭐물꼬" class="logo" />
        <div class="shop-info">
          <h3>코이보타루 <span class="verified">✔</span></h3>
          <p><strong>김수빈</strong> 사장님</p>
        </div>
      </div>
  
      <nav class="menu-container">
        <button class="menu-item">홈</button>
        <button class="menu-item active">주문 관리</button>
        <button class="menu-item">매출 관리</button>
        <button class="menu-item">메뉴 관리</button>
        <button class="menu-item">가게 관리</button>
        <button class="menu-item">설정</button>
      </nav>
  
      <div class="footer">
        <p>고객센터 000-111-222</p>
        <p>All rights Reserved © Momulggo, 2026</p>
      </div>
    </aside>
  </template>
  
  <style scoped>
  .sidebar {
    width: 280px; /* 사이드바 폭 소폭 확대 */
    height: calc(100vh - 40px);
    margin: 20px;
    background: #fff;
    border-radius: 40px;
    box-shadow: 10px 0 30px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    padding: 50px 25px;
    position: sticky;
    top: 20px;
  }
  
  .logo-section { 
    text-align: center; 
    margin-bottom: 120px; /* 메뉴를 더 내리기 위해 여백 확대 */
  }
  
  .logo { 
    width: 250px; /* 로고 사이즈 대폭 확대 */
    margin-bottom: 20px; 
  }
  
  .shop-info h3 { font-size: 22px; margin-bottom: 15px; color: #333; }
  .verified { color: #3f51b5; font-size: 18px; }
  .shop-info p { font-size: 15px; color: #666; }
  
  .menu-container { flex: 1; display: flex; flex-direction: column; gap: 15px; }
  
  .menu-item {
    width: 100%;
    padding: 10px;
    border-radius: 12px;
    border: 1px solid #c6c0d0; /* 연한 보라색 테두리 */
    background: #fff;
    color: #5d5868;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .menu-item.active {
    background: linear-gradient(90deg, #6200ea, #3f51b5);
    color: #fff;
    border: none;
  }
  
  .footer { font-size: 11px; color: #bbb; text-align: center; line-height: 1.5; }
  </style>