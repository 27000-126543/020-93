export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/scan/index',
    'pages/basket/index',
    'pages/mine/index',
    'pages/flow/index',
    'pages/material-detail/index',
    'pages/photo-submit/index',
    'pages/basket-edit/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1677ff',
    navigationBarTitleText: '牙科材料效期核验',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f7fa'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#1677ff',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/scan/index',
        text: '扫码核验'
      },
      {
        pagePath: 'pages/basket/index',
        text: '材料篮'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
