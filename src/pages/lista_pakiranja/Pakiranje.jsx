
export default function Pakiranje ({pakiranje, promijeni}){

     return (
        <div>
            <input
                type="checkbox"
                checked={pakiranje.spakirano}
                onChange={() => promijeni(pakiranje.sifra)}
            />
            {' '}
            {pakiranje.naziv}
        </div>
    )

}