import { ClipLoader } from "react-spinners";

function Spinner(props){
    return(
        <>
              <ClipLoader
                    color={"#500ECE"}
                    loading={props.loading}
                    cssOverride={true}
                    size={50}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                />
        </>
    )
}

export default Spinner;