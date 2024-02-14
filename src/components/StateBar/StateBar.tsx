import "./StateBar.css"
export default function StateBar({file, ln, coln} : {file: string, ln: Number, coln: Number}){
  return(
    <>
      <div className="stateBar" style={{height: `${window.screen.height *0.03}`}}>
        <section>{file}</section>
        <section>Line: {`${ln}`}, Column: {`${coln}`}</section>
      </div>
    </>
  )
}