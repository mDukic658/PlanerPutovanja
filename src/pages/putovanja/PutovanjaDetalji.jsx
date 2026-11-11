import { Link } from "react-router-dom"
import { FaArrowLeft } from "react-icons/fa"
import { RouteNames } from "../../constants"

export default function PutovanjaDetalji() {
    return (
        <section className="putovanje-detalji">
            <Link
                to={RouteNames.PUTOVANJA}
                className="natrag-na-pregled"
            >
                <FaArrowLeft />
                {" "}Natrag na pregled putovanja
            </Link>

            <h2>Detalji putovanja</h2>
        </section>
    )
}