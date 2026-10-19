import { Button } from "react-bootstrap";

function CoverPhoto({ naslov, opis, slika }) {
    return (
        <div>
            <img src={slika} alt={naslov} />
            <h3> {naslov} </h3>
            <p>{opis} </p>
            <Button> Više </Button>
        </div>
    )
}

export default CoverPhoto 