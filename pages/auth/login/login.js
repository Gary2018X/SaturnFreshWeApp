import {
  successToast,
  navigateTo
} from "../../../utils/toolMethods";

var api = require('../../../config/api.js');
var util = require('../../../utils/util.js');
var user = require('../../../utils/user.js');

var app = getApp();
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
  },
  onLoad: function (options) {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },
  onReady: function () {

  },
  onShow: function () {
    // 页面显示
    // let that = this;
    // wx.login({
    //   success(res) {
    //     util.request(api.getSessionKeyByCode, {
    //       code: res.code,
    //     }, 'POST').then(res => {
    //       if (res.errno === 0) {
    //         wx.setStorageSync('openId', res.data);
    //         that.setData({
    //           sessionKey: res.data
    //         })
    //       }
    //     })
    //   }
    // })

  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        this.login()
      }
    })
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    this.login()
  },
  login: function (e) {
    let that = this;
    wx.login({
      success(res) {
        util.request(api.getSessionKeyByCode, {
          code: res.code,
          user_info:that.data.userInfo
        }, 'POST').then(res => {
          if (res.code === 200) {
            wx.setStorageSync('openId', res.data.openid);
            that.setData({
              sessionKey: res.data.session_key
            })
            wx.setStorageSync('userInfo',that.data.userInfo);
            console.log(that.data.userInfo)
            wx.setStorageSync('token', res.data.session_key);
            app.globalData.hasLogin = true;
            app.globalData.tabBarCartNum = res.data.cartGoodsCount;
            successToast("登录成功");
            setTimeout(() => {
              wx.switchTab({
                url: '/pages/ucenter/index/index'
              });
            }, 600)
          }
        })
      }
    })
    console.log(that.data)
  },
  wxLogin: function (e) {
    if (e.detail.userInfo == undefined) {
      app.globalData.hasLogin = false;
      util.showErrorToast('微信登录失败');
      return;
    }

    user.checkLogin().catch(() => {

      user.loginByWeixin(e.detail.userInfo).then(res => {
        app.globalData.hasLogin = true;

        wx.navigateBack({
          delta: 1
        })
      }).catch((err) => {
        app.globalData.hasLogin = false;
        util.showErrorToast('微信登录失败');
      });

    });
  },

  getPhoneNumber(e) {
    let that = this;

    let decryptData = {
      encryptedData: e.detail.encryptedData,
      iv: e.detail.iv,
    };

    util.request(api.loginByWeChatPhone, {
      sessionKey: that.data.sessionKey,
      userInfo: {},
      encryptedData: decryptData.encryptedData,
      iv: decryptData.iv,
      co: wx.getStorageSync('inviteId')
    }, 'POST').then(res => {
      if (res.errno === 0) {
        //存储用户信息
        wx.setStorageSync('userInfo', res.data.userInfo);
        wx.setStorageSync('token', res.data.token);
        app.globalData.hasLogin = true;
        app.globalData.tabBarCartNum = res.data.cartGoodsCount;

        successToast("登录成功");
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/ucenter/index/index'
          });
        }, 600)
      }
    })

  },

  accountLogin: function () {
    navigateTo("/pages/auth/phoneLogin/phoneLogin");
  },

  enterServiceAgreement() {
    navigateTo("/pages/auth/serviceAgreement/serviceAgreement");
  },

  enterPrivacyPolicy() {
    navigateTo("/pages/auth/privacyPolicy/privacyPolicy");
  }

});