import { Component, ViewChild, OnInit, ElementRef } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { ActivatedRoute, Router } from '@angular/router'

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  music: any[]
  duration: string = '00:00'
  currentTime: string = '00:00'
  currentIndex: number = 0
  progress: number = 0
  seekable: number = 0
  volume: number = 0.6
  repeat: boolean = false
  shuffle: boolean = false
  menuOpen: boolean = false
  menuOn: boolean = false
  menu: any[]
  played: any[] = []

  @ViewChild('audio') audio: ElementRef
  @ViewChild('playlist') playlist: ElementRef

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {
  }

  ngOnInit () {
    const session_id = localStorage.getItem('session_id')
    this.volume = localStorage.getItem('volume') ? parseFloat(localStorage.getItem('volume')) : this.volume
    this.http.get(`https://dev.opendrive.com/api/v1/folder/list.json/${session_id}/0`).subscribe(data => {
      this.menu = data['Folders']
    }, err => {
      this.router.navigateByUrl('login')
    })
    this.route.params.subscribe(params => {
      this.http.get(`https://dev.opendrive.com/api/v1/folder/list.json/${session_id}/${params['id']}`).subscribe(folder => {
        this.music = folder['Files'].filter(item => {
          return item['Name'].indexOf('mp3') !== -1
        }).map(item => {
          item['Name'] = item['Name'].replace('.mp3', '')
          return item
        })
        if (this.music.length) {
          this.run(0)
        }
      }, err => {
        this.router.navigateByUrl('')
      })
    })
  }

  run (index: number, auto: boolean = false) {
    if (this.played.length === this.music.length) {
      this.played = []
    }
    if (this.shuffle && auto) {
      do {
        index = Math.floor(Math.random() * (this.music.length - 1))
      } while (this.played.includes(index))
    }
    if (index >= this.music.length) {
      index = 0
    }
    if (index < 0) {
      index = this.music.length - 1
    }
    if (!this.played.includes(index)) {
      this.played.push(index)
    }
    this.currentIndex = index
    this.audio.nativeElement.src = this.music[index]['StreamingLink']
    this.audio.nativeElement.load()
    this.audio.nativeElement.play()
    document.title = this.music[index]['Name']
    if (this.playlist) {
      this.playlist.nativeElement.querySelectorAll('li')[index].scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  goTo (e) {
    this.audio.nativeElement.currentTime = this.audio.nativeElement.duration * e.offsetX / e.currentTarget.offsetWidth
    this.timeupdate()
  }

  changeVolume (e) {
    this.volume = e.offsetX / e.currentTarget.offsetWidth
    localStorage.setItem('volume', this.volume.toString())
  }

  muted () {
    this.volume = this.volume !== 0 ? 0 : parseFloat(localStorage.getItem('volume'))
  }

  timeupdate () {
    const progress = 100 * this.audio.nativeElement.currentTime / this.audio.nativeElement.duration
    const endVal = this.audio.nativeElement.seekable && this.audio.nativeElement.seekable.length ? this.audio.nativeElement.seekable.end(0) : 0
    const currentMinute = Math.floor(this.audio.nativeElement.currentTime / 60)
    const currentSecond = Math.floor(this.audio.nativeElement.currentTime % 60)
    const trackMinute = Math.floor(this.audio.nativeElement.duration / 60)
    const trackSecond = Math.floor(this.audio.nativeElement.duration % 60)
    this.progress = isNaN(progress) ? 0 : progress
    this.seekable = 100 / (this.audio.nativeElement.duration || 1) * endVal
    this.currentTime = !isNaN(currentMinute) && !isNaN(currentSecond) ? currentMinute.toString().padStart(2, '0') + ':' + currentSecond.toString().padStart(2, '0') : '00:00'
    this.duration = !isNaN(trackMinute) && !isNaN(trackSecond) ? trackMinute.toString().padStart(2, '0') + ':' + trackSecond.toString().padStart(2, '0') : '00:00'
  }

  toggleMenu () {
    this.menuOn = !this.menuOn
    this.menuOpen = !this.menuOpen
  }

  logout () {
    this.toggleMenu()
    localStorage.removeItem('session_id')
    this.router.navigateByUrl('login')
  }
}
