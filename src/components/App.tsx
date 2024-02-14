import {SetStateAction, useState} from "react";
import {useInterval} from "@react-hooks-library/core";
import StateBar from "./StateBar/StateBar";
import File from "./File/File";
import "./App.css"

import { open, save, confirm} from '@tauri-apps/api/dialog'
import { appConfigDir } from '@tauri-apps/api/path';
import {fs, invoke} from "@tauri-apps/api";

export default function App(){
  const [activePath, setActivePath]: [string, React.Dispatch<SetStateAction<string>>] = useState("");
  const [lineNumber, setLineNumber]: [number, React.Dispatch<SetStateAction<number>>] = useState(1);
  const [columnNumber, setColumnNumber]: [number, React.Dispatch<SetStateAction<number>>] = useState(1);
  const [needsSaving, setNeedsSaving]: [boolean, React.Dispatch<SetStateAction<boolean>>] = useState(false);
  const [fileState, setFileState]: [string, React.Dispatch<SetStateAction<string>>] = useState("");
  const [fontSize, setFontSize]: [number, React.Dispatch<SetStateAction<number>>] = useState(16);
  const [files, setFiles] = useState([] as string[])

  const openFile = async () => {
    await open({
      directory: false,
      multiple: false,
      defaultPath: activePath.substring(0, activePath.lastIndexOf("\\")) || await appConfigDir(),
    }).then(select =>{
      if(typeof select === 'string'){
        setActivePath(select);
        
        fs.readTextFile(select).then(text=>{
          const textarea : HTMLTextAreaElement = document.querySelector("textarea") as HTMLTextAreaElement;
          textarea.value = text
        })
        .catch(()=>{console.log(":(")})
      }
    })
    .catch((err)=>{console.log(err)});
  }

  const openFolder = async() =>{

    await open({
      directory: true,
      multiple: false,
      defaultPath: activePath.substring(0, activePath.lastIndexOf("\\")) || await appConfigDir(),
    }).then(select =>{
      if(typeof select === 'string'){
        setActivePath(select);
        fs.readDir(select, {recursive:true}).then(fileArr=>{
          fileArr.forEach(file=>{
            console.log(file)
            setFiles(prev => [...prev, file.path])
          })
        })
      }
    })
    .catch((err)=>{console.log(err)});
  }

  const saveFile = async () =>{

    if(activePath == ""){
      await save({
        filters:[{
          name: "Text",
          extensions:["txt", "c", "cpp", "py", "html", "asm", "htm"]
        }]
      }).then(path=>{
        if(path !== null){
          setActivePath(path);
          setNeedsSaving(false);
        }
      })
    }
    else{
      const textarea : HTMLTextAreaElement = document.querySelector("textarea") as HTMLTextAreaElement;
      fs.writeTextFile(activePath, textarea.value)
      .then(_=>{
        setNeedsSaving(false)
        setFileState(textarea.value)
      })
    }
    setNeedsSaving(false)
  }

  const newFile = (): any =>{
    if(needsSaving){
      confirm("Changes weren't saved. Reject changes and open a new file?").then(result=>{
        if(result){
          const textarea : HTMLTextAreaElement = document.querySelector("textarea") as HTMLTextAreaElement;
          textarea.value = "";
          setActivePath("");
          setNeedsSaving(false);
          return
        }
        else{
          return
        }
      })
    }
    else{
      const textarea : HTMLTextAreaElement = document.querySelector("textarea") as HTMLTextAreaElement;
      textarea.value = "";
      setActivePath("");
    }
    

  }

  const tabHandler = (event: KeyboardEvent): void =>{
    if(event.key == "Tab"){
      event.preventDefault();
      event.stopPropagation();
      const textarea : HTMLTextAreaElement = document.querySelector("textarea") as HTMLTextAreaElement;
      let startPos = textarea.selectionStart;
      let endPos = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, startPos)
            + "    "
            + textarea.value.substring(endPos, textarea.value.length);
      textarea.selectionStart = startPos + 4;
      textarea.selectionEnd = startPos + 4;
    }
  }

  const shortcutHandler = (event: KeyboardEvent) : any =>{
    if(event.ctrlKey && event.shiftKey && event.key == "O"){
      setFiles([] as string[]);
      openFolder();
    }
    else if(event.ctrlKey && event.key == "o"){
      openFile();
    }
    else if(event.ctrlKey && event.key == "s"){
      saveFile();
    }
    else if(event.ctrlKey && event.key == "n"){
      newFile();
    }
    else if(event.ctrlKey && event.key === "="){
      const textarea : HTMLTextAreaElement = document.querySelector("textarea") as HTMLTextAreaElement;
      setFontSize((prevfontSize) => prevfontSize + 2);
      textarea.style.fontSize = `${fontSize + 2}px`
      console.log(textarea.style.fontSize)
    }
    else if(event.ctrlKey && event.key === "-"){
      const textarea : HTMLTextAreaElement = document.querySelector("textarea") as HTMLTextAreaElement;
      setFontSize((prevfontSize) => prevfontSize - 2);
      textarea.style.fontSize = `${fontSize - 2}px`
      console.log(textarea.style.fontSize)
    }
    else{
      const textarea : HTMLTextAreaElement = document.querySelector("textarea") as HTMLTextAreaElement;
      if(textarea.value !== fileState){
        setNeedsSaving(true);
        invoke('get_needs_saving',{ needsSaving: needsSaving });
      }
    }
  }

  const getCursorPosition = () => {

    const textarea : HTMLTextAreaElement = document.querySelector("textarea") as HTMLTextAreaElement;
    let position: number = textarea.selectionStart;
    let content: string = textarea.value;
    let rows: string[] = content.substring(0, position).split("\n");
    let col: number = (rows.length === 1) ? position + 1 : position - rows.slice(0, -1).join("\n").length;

    setLineNumber(rows.length);
    setColumnNumber(col)
  }
    document.onkeydown = tabHandler;
    document.onkeyup = shortcutHandler;
    useInterval(()=>{
      if(needsSaving){
        saveFile();
      }
    }, 5000);
    
    const fileElements = files.map(file=>{
      return <File key={file} path={file}/>
    })
    return(
      <>
      <div className="main">
        <div className="files">
          {fileElements}
        </div>
        <textarea spellCheck={false} autoFocus={true} onChange={getCursorPosition}></textarea>
      </div>
        
        <StateBar file={activePath.split("\\")[activePath.split("\\").length - 1] || "No file opened"} ln={lineNumber} coln={columnNumber}/>
      </>
    )
}