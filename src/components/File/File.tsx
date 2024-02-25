import "./File.css"
import { useState } from "react"
import { event, fs } from "@tauri-apps/api"
import { FileEntry } from "@tauri-apps/api/fs";
export default function File({path, children, onClick}:{path: string, children: FileEntry[] | undefined, onClick:((file: string) => void)}){
  const [files, setFiles] = useState([] as FileEntry[])
  const [isLoaded, setIsLoaded] = useState(false);
  if(!(/^[\w \[\$\&\+\,\:\;\=\?\@\#\|\'\<\>\.\-\^\*\(\)\%\!\]]{0,}\.[\w]+$/.test(path.substring(path.lastIndexOf('\\')+1))) && !['.git', "node_modules"].includes(path.substring(path.lastIndexOf('\\')+1))){
    console.log(path.substring(path.lastIndexOf('\\')+1))
    if(!isLoaded){
      if(children != undefined){
        setFiles(prev => [...prev, ...children])
      }
      setIsLoaded(true);
    }
    
  }

  const handleClick = () =>{
    onClick(path);
  }

  return(
    <div className="file" onClick={handleClick}>
      {path.substring(path.lastIndexOf('\\')+1)}
      <div className="children">
        {
          files.map(file=>{
              return <File key={file.path} path={file.path} children={file.children} onClick={onClick}/>
          })
        }
      </div>
    </div>
  )
}