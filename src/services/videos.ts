import { FirestoreService } from "@/firebase/firestoreService"


type VideosFetch = {
    id : string ;
    imageUrl: string;
    videoUrl: string;
}

export type VideoCreate = {
    image: File;
    videoUrl: string;
}

export async function fetchVideos() {

    const videos = await FirestoreService.getAllDocs(`Videos`) as VideosFetch[]

    return videos
}


export async function createVideo({ image , videoUrl } : VideoCreate) {

     await FirestoreService.addDoc("Videos",{
        imageUrl : await FirestoreService.uploadFile(image , "Video") ,
        videoUrl : videoUrl
    }) 

    
}


export async function deleteVideo(docId : string) {

     await FirestoreService.deleteDoc("Videos",docId) 
    
}
