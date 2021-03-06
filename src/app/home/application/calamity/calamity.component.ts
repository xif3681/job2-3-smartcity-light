/*

Copyright(c): 2018 深圳创新设计研究院
Author: luo.shuqi@live.com
@file: calamity.component.ts
@time: 2018 /8 / 9 9: 00

*/
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Point } from '../../../data/point.type';
import { CALAMITYLIST } from '../../../data/calamity-list';
import { MonitorService } from '../../../service/monitor.service';
import { VideoService } from '../../../service/video.service';
// baidu map
declare let BMap;
declare let $: any;
declare let BMapLib;
declare let BMAP_ANCHOR_TOP_LEFT;

@Component({
  selector: 'app-calamity',
  templateUrl: './calamity.component.html',
  styleUrls: ['./calamity.component.scss']
})
export class CalamityComponent implements OnInit, OnDestroy {

  @ViewChild('map5') map_container: ElementRef;
  model: any = {}; // 存储数据

  map: any; // 地图对象
  timer: any; // 定时器

  cityList: any; // 城市列表
  deviceList: any; // 城市列表
  defaultZone: any; // 默认城市
  currentCity: any; // 当前城市
  currentChildren: any; // 当前城市节点
  currentBlock: any; // // 当前城市街道
  device: any; // // 当前设备点

  deviceChild: any; // // 当前设备点上-被点击的子设备
  areashow = false; // 默认区域列表不显示
  cityshow = false; // 默认区域列表不显示
  deviceshow = false; // 默认设备列表不显示

  visible = true; // 控制可视区域

  zoom: any; // 地图级数
  SouthWest: Point; // 地图视图西南角
  NorthEast: Point; // 地图视图东北角
  type = 0; // 设备类型

  parentNode = null; // 用于递归查询JSON树 父子节点
  node = null; // 用于递归查询JSON树 父子节点

  light_list = []; // 数据模拟
  light_list_change: any; // 数据模拟

  constructor(private monitorService: MonitorService, private videoService: VideoService ) {

   }

  ngOnInit() {
    this.addBeiduMap();
    this.getCity(); // 获取城市列表

  }



  // 百度地图API功能
  addBeiduMap() {

    const map = this.map = new BMap.Map(this.map_container.nativeElement, {
      enableMapClick: true,
      // minZoom: 11,
      // maxZoom : 11
    }); // 创建地图实例


    // 这里我们使用BMap命名空间下的Point类来创建一个坐标点。Point类描述了一个地理坐标点，其中116.404表示经度，39.915表示纬度。（为天安门坐标）

    const point = new BMap.Point(113.924755, 22.49934); // 坐标可以通过百度地图坐标拾取器获取 --万融大厦
    map.centerAndZoom(point, 16); // 设置中心和地图显示级别

    map.enableScrollWheelZoom(true); // 开启鼠标滚轮缩放



    map.setMapStyle({ style: 'normal' });   // dark


    // 添加控件缩放

    const offset = new BMap.Size(20, 55);
    const navigationControl = new BMap.NavigationControl({
      anchor: BMAP_ANCHOR_TOP_LEFT,
      offset: offset,
    });
    map.addControl(navigationControl);



    this.getLights(); // 获取地图上的点
    this.timer = setInterval(() => {
      this.getLights(); // 获取地图上的点
    }, 10000);



  }


  getLights() {
    const that = this;

    this.videoService.getCalamity().subscribe({
      next: function (val) {
        that.light_list = val;
        const compar = that.judgeChange(that.light_list);
        console.log(compar);
        that.deleMarker(compar.a0); // 删除
        that.changeMarker(compar.b1); // 替换

      },
      complete: function () {
      },
      error: function (error) {
        console.log(error);
      }
    });



  }
  // 判断变化值
  judgeChange(array) {
    const a0 = [];
    const b1 = [];
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      if (element.error === 1) {
        b1.push(element);
      } else {
        a0.push(element);
      }
    }
    return {
      a0: a0,
      b1: b1
    };
  }




  // 替换
  changeMarker(light_list) {
    this.deleMarker(light_list); // 删除
    this.addMarker(light_list); // 添加
  }
  // 删除
  deleMarker(light_list) {
    const makers = this.map.getOverlays();
    for (let ind = 0; ind < light_list.length; ind++) {
      const ele = light_list[ind];
      const point = light_list[ind].point;
      for (let index = 0; index < makers.length; index++) {
        const element = makers[index];
        const lat = element.point && element.point.lat;
        const lng = element.point && element.point.lng;
        if (point[1] === lat && point[0] === lng) {
          this.map.removeOverlay(makers[index]);
        }

      }
    }
  }

  addMarker(light_list) {
    const makers = this.map.getOverlays();
    for (let index = 0; index < light_list.length; index++) {
      const item = light_list[index];
      const point = new BMap.Point(item.point[0], item.point[1]);

      let myIcon;
      if (item.type === 1 && item.error === 1) { // 异常
        myIcon = new BMap.Icon('../../../../assets/imgs/Earthquake.gif', new BMap.Size(300, 157));
        myIcon.setAnchor(new BMap.Size(16, 38));
        const marker2 = new BMap.Marker(point, { icon: myIcon });  // 创建标注
        this.map.addOverlay(marker2);
      } else if (item.type === 2 && item.error === 1) { // 灯亮
        myIcon = new BMap.Icon('../../../../assets/imgs/water.gif', new BMap.Size(300, 157));
        myIcon.setAnchor(new BMap.Size(16, 38));
        const marker2 = new BMap.Marker(point, { icon: myIcon });  // 创建标注
        this.map.addOverlay(marker2);

      } else if (item.type === 3 && item.error === 1) { // 正常
        myIcon = new BMap.Icon('../../../../assets/imgs/gif001.gif', new BMap.Size(300, 157));
        myIcon.setAnchor(new BMap.Size(16, 38));
        const marker2 = new BMap.Marker(point, { icon: myIcon });  // 创建标注
        this.map.addOverlay(marker2);

      } else if (item.type === 4 && item.error === 1) { // 正常
        myIcon = new BMap.Icon('../../../../assets/imgs/gif002.gif', new BMap.Size(300, 157));
        myIcon.setAnchor(new BMap.Size(16, 38));
        const marker2 = new BMap.Marker(point, { icon: myIcon });  // 创建标注
        this.map.addOverlay(marker2);

      } else if (item.type === 5 && item.error === 1) { // 正常
        myIcon = new BMap.Icon('../../../../assets/imgs/gif003.gif', new BMap.Size(300, 157));
        myIcon.setAnchor(new BMap.Size(16, 38));
        const marker2 = new BMap.Marker(point, { icon: myIcon });  // 创建标注
        this.map.addOverlay(marker2);

      }

    }
  }

  // 解析地址- 设置中心和地图显示级别
  getPoint(baiduMap, city) {
    const that = this;
    // 创建地址解析器实例
    const myGeo = new BMap.Geocoder();
    const zoom = this.zoom = this.switchZone(city.level);
    const fullName = city.full_name;
    console.log(city);

    let pt;

    // 将地址解析结果显示在地图上,并调整地图视野，获取数据-添加标注
    myGeo.getPoint(fullName, function (point) {
      if (point) {
        baiduMap.centerAndZoom(point, zoom);
        pt = point;

      } else {
        console.log('您选择地址没有解析到结果!');
      }
    }, '');
  }

  // 获取数据

  // 获取城市列表 --ok
  getCity() {
    const that = this;

    this.monitorService.getZoneDefault().subscribe({
      next: function (val) {
        that.cityList = val.regions;
        that.currentCity = val.zone;
        that.zoom = that.switchZone(val.zone.level);
        that.node = that.getNode(val.regions, val.zone.region_id);
        that.currentChildren = that.node.children;

      },
      complete: function () {

      },
      error: function (error) {
        console.log(error);
      }
    });
  }
  // 获取设备列表 -- ok
  // getDevice() {
  //   const that = this;

  //   this.monitorService.getDevice().subscribe({
  //     next: function (val) {
  //       that.deviceList = val;

  //     },
  //     complete: function () {


  //     },
  //     error: function (error) {
  //       console.log(error);
  //     }
  //   });
  // }

  // 省市区街道-地图级别
  switchZone(level) {
    let zone = 12;
    switch (level) {
      case 1:
        zone = 10;
        break;
      case 2:
        zone = 12;
        break;
      case 3:
        zone = 15;
        break;
      case 4:
        zone = 19;
        break;
      default:
        break;
    }
    return zone;
  }

  //
  /*
   * 递归查询JSON树 父子节点
   */


  /**
   * 根据NodeID查找当前节点以及父节点
   *
   * @param  {[type]}
   * @param  {[type]}
   * @return {[type]}
   */

  getNode(json, nodeId) {
    const that = this;

    // 1.第一层 root 深度遍历整个JSON
    for (let i = 0; i < json.length; i++) {
      if (that.node) {
        break;
      }

      const obj = json[i];

      // 没有就下一个
      if (!obj || !obj.id) {
        continue;
      }
      // console.log(nodeId);
      // console.log(obj.id);
      // 2.有节点就开始找，一直递归下去
      if (obj.id === nodeId) {
        // 找到了与nodeId匹配的节点，结束递归
        that.node = obj;

        break;
      } else {

        // 3.如果有子节点就开始找
        if (obj.children) {
          // 4.递归前，记录当前节点，作为parent 父亲
          that.parentNode = obj;

          // 递归往下找
          that.getNode(obj.children, nodeId);
        } else {
          // 跳出当前递归，返回上层递归
          continue;
        }
      }
    }


    // 5.如果木有找到父节点，置为null，因为没有父亲
    if (!that.node) {
      that.parentNode = null;
    }

    // 6.返回结果obj
    // return {
    //   parentNode: that.parentNode,
    //   node: that.node
    // };
    return that.node;
  }


  // 进入全屏
  enterFullScreen() {
    console.log('进入全屏');
    console.log(this.visible);
    // this.visible = false;
    // localStorage.setItem('visible', 'false');

    // 设置缩放控件偏移量
    // const offset = new BMap.Size(20, 15);
    // this.navigationControl.setOffset(offset);

    // this.communicateService.sendMessage(this.visible); // 发布一条消息
    // this.fullScreenService.enterFullScreen();

  }


  // 选择区域
  // 选择城市
  selecteCity(city) {
    this.currentCity = city;
    this.getPoint(this.map, city);  // 解析地址- 设置中心和地图显示级别
    this.currentChildren = city.children;
  }

  selecteblock(block) {
    this.getPoint(this.map, block);  // 解析地址- 设置中心和地图显示级别
  }

  // 显示区域
  showArea() {
    this.areashow = true;
  }
  // 显示城市
  showCiyt() {
    this.cityshow = true;
  }
  // 显示设备
  showDevice() {
    this.deviceshow = true;
  }

  // 选择区域
  arealistMouseover(area) {

    this.currentBlock = area.children;
  }
  // 离开区域
  arealistMouseleave() {
    this.areashow = false;
    this.currentBlock = null;
  }
  // 离开城市
  citylistMouseleave() {
    this.cityshow = false;
  }
  // 离开设备
  devicelistMouseleave() {
    this.deviceshow = false;
  }
  arealistMouseNone() {
    this.areashow = true;
    this.currentBlock = null;
  }

  ngOnDestroy() {
    window.clearInterval(this.timer);
  }
}
