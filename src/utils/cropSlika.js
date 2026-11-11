function ucitajSliku(src) {
    return new Promise((resolve, reject) => {
        const slika = new Image()

        slika.onload = () => resolve(slika)
        slika.onerror = () => reject(
            new Error("Učitavanje slike nije uspjelo.")
        )

        slika.src = src
    })
}

export async function izreziSliku(
    src,
    odabraniDio,
    rotacija = 0,
    maksimalnaDimenzija = 1200
) {
    const slika = await ucitajSliku(src)
    const radijani = rotacija * Math.PI / 180

    const sirina = Math.ceil(
        Math.abs(Math.cos(radijani) * slika.width) +
        Math.abs(Math.sin(radijani) * slika.height)
    )

    const visina = Math.ceil(
        Math.abs(Math.sin(radijani) * slika.width) +
        Math.abs(Math.cos(radijani) * slika.height)
    )

    const canvas = document.createElement("canvas")
    canvas.width = sirina
    canvas.height = visina

    const ctx = canvas.getContext("2d")

    ctx.translate(sirina / 2, visina / 2)
    ctx.rotate(radijani)
    ctx.translate(-slika.width / 2, -slika.height / 2)
    ctx.drawImage(slika, 0, 0)

    const omjer = Math.min(
        1,
        maksimalnaDimenzija /
            Math.max(odabraniDio.width, odabraniDio.height)
    )

    const rezultat = document.createElement("canvas")

    rezultat.width = Math.max(
        1,
        Math.round(odabraniDio.width * omjer)
    )

    rezultat.height = Math.max(
        1,
        Math.round(odabraniDio.height * omjer)
    )

    const rezultatCtx = rezultat.getContext("2d")

    rezultatCtx.fillStyle = "#fff"
    rezultatCtx.fillRect(
        0,
        0,
        rezultat.width,
        rezultat.height
    )

    rezultatCtx.drawImage(
        canvas,
        odabraniDio.x,
        odabraniDio.y,
        odabraniDio.width,
        odabraniDio.height,
        0,
        0,
        rezultat.width,
        rezultat.height
    )

    return rezultat.toDataURL("image/jpeg", 0.85)
}