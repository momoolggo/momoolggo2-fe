<template>
    <header class="top_header">
      <div class="header_left">
        <img src="@/assets/로고수정.png" alt="logo" class="header_logo_img" />
        <span class="header_title">관리자 서비스</span>
      </div>
      <span class="admin_greeting">관리자 님 안녕하세요</span>
    </header>
  </template>
  
  <style scoped>
  .top_header {
    background: #9b1b1b;
    padding: 20px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 10;
    margin-left: 30px;
  }
  
  .header_left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .header_logo_img {
    width: 80px;
    height: auto;
  }
  
  .header_title {
    font-size: 22px;
    margin-left: 18px;
    font-weight: 700;
    color: #fff;
  }
  
  .admin_greeting {
    font-size: 13px;
    color: #fff;
  }
  </style>