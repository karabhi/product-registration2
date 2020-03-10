import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild
} from "@angular/core";
import axios from "axios";
import { HttpClient, HttpEventType } from "@angular/common/http";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  @ViewChild("video", { static: true }) videoElement: ElementRef;
  @ViewChild("canvas", { static: true }) canvas: ElementRef;

  public captures: Array<any>;
  public encodedString: any;
  public imageFile: File;
  public message: string;
  public blobImage:any;

  axiosResponse: any;
  videoWidth = 0;
  videoHeight = 0;
  constraints = {
    video: {
      facingMode: "environment",
      width: { ideal: 4096 },
      height: { ideal: 2160 }
    }
  };

  constructor(private renderer: Renderer2, private httpClient: HttpClient) {
    this.captures = [];
  }

  ngOnInit() {
    this.startCamera();
  }

  startCamera() {
    if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      navigator.mediaDevices
        .getUserMedia(this.constraints)
        .then(this.attachVideo.bind(this))
        .catch(this.handleError);
    } else {
      alert("Sorry, camera not available.");
    }
  }

  attachVideo(stream) {
    this.renderer.setProperty(
      this.videoElement.nativeElement,
      "srcObject",
      stream
    );
    this.renderer.listen(this.videoElement.nativeElement, "play", event => {
      this.videoHeight = this.videoElement.nativeElement.videoHeight;
      this.videoWidth = this.videoElement.nativeElement.videoWidth;
    });
  }

  capture() {
    this.renderer.setProperty(
      this.canvas.nativeElement,
      "width",
      this.videoWidth
    );
    this.renderer.setProperty(
      this.canvas.nativeElement,
      "height",
      this.videoHeight
    );
    this.canvas.nativeElement
      .getContext("2d")
      .drawImage(this.videoElement.nativeElement, 0, 0);

    var ctx = this.canvas.nativeElement.getContext("2d");
    this.imageFile = this.canvas.nativeElement.toDataURL("image/png");
    this.captures.push(this.canvas.nativeElement.toDataURL("image/png"));

    this.encodedString = this.canvas.nativeElement.toDataURL("image/png", 1.0);
    this.blobImage = this.b64toBlob(this.encodedString);

    this.encodedString = this.encodedString.replace(
      /^data:image\/(png|jpg|jpeg);base64,/,
      ""
    );
    //console.log(this.encodedString);

    const uploadImageData = new FormData();
    uploadImageData.append("imageFile", this.blobImage);

    this.httpClient
      .post("http://192.168.0.6:8080/api/detect/img", uploadImageData, {
        observe: "response"
      })

      .subscribe(response => {
        if (response.status === 200) {
          this.message = "Image uploaded successfully";
        } else {
          this.message = "Image not uploaded successfully";
        }
        console.log(response);
      });

    // axios.post('http://192.168.0.6:8080/api/detect/img',uploadImageData)
    // .then(function(response){
    //     console.log(response);
    // })
    // .catch(function (error) {
    //     console.log(error);
    // });
  }

  handleError(error) {
    console.log("Error: ", error);
  }

  b64toBlob(dataURI) {

    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);

    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/jpeg' });
}
}
