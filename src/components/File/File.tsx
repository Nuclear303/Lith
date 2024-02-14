import "./File.css"
export default function File({path}:{path: string}){
  return(
    <div className="file">{path.substring(path.lastIndexOf('\\')+1)}</div>
  )
}