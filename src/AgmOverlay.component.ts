import { Subscription } from "rxjs"
import {
  Input, Component, Optional,
  TemplateRef, ViewChild, ElementRef
} from "@angular/core"

import {
  LatLngBounds, LatLng,
  GoogleMapsAPIWrapper
} from "@agm/core"

import { GoogleMap } from "@agm/core/services/google-maps-types"
declare var google: any

@Component({
  selector:"agm-overlay",
  template:'<div #content><div style="position:absolute"><ng-content></ng-content></div></div>'
}) export class AgmOverlay{
  overlayView:any
  @Input() latitude:number
  @Input() longitude:number

  @ViewChild('content', { read: ElementRef }) template: ElementRef

  constructor(protected _mapsWrapper:GoogleMapsAPIWrapper){}

  ngOnChanges( changes ){
    if( (changes.latitude || changes.longitude) && this.overlayView ){
      this.destroy()
      this.load()
    }
  }

  ngOnDestroy(){
    this.destroy()
  }

  destroy(){
    const div = this.overlayView.div
    div.parentNode.removeChild( div )
    delete this.overlayView.div
    this.overlayView.setMap( null )
    delete this.overlayView
  }

  ngAfterViewInit(){
    this.load()
  }

  load(){
    return this._mapsWrapper.getNativeMap()
    .then( map=>this.loadByMap(map) )
  }

  loadByMap( map:GoogleMap ){
    // appends to map as overlays (markers)
    this.drawOnMap( map )

    const latlng = new google.maps.LatLng(this.latitude, this.longitude)

    // configures the bounds of the map to fit the markers
    this.addBounds( latlng, map )
  }

  addBounds( latlng:LatLng, map:GoogleMap ){
    let bounds = map.getBounds() || map['bounds']
    
    if( !bounds ){
      bounds = new google.maps.LatLngBounds()
      map['bounds'] = bounds
    }
    bounds.extend( latlng )
    this._mapsWrapper.fitBounds( bounds )//center map on all overlays
  }

  drawOnMap( map:GoogleMap ){
    this.overlayView = this.overlayView || new google.maps.OverlayView()
    const latlng = new google.maps.LatLng(this.latitude,this.longitude)
    const elm = this.template.nativeElement.children[0]

    this.overlayView.draw = function(){
      if ( !this.div ) {
        this.div = elm
        this.getPanes().overlayImage.appendChild( elm )
      }

      const point = this.getProjection().fromLatLngToDivPixel( latlng )

      if (point) {
        elm.style.left = (point.x - 10) + 'px'
        elm.style.top = (point.y - 20) + 'px'
      }
    }
    
    this.overlayView.setMap( map )//igniter to append to element
  }
}