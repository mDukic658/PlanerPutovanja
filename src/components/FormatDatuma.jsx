
export default function FormatDatuma ({datum, prikazDatuma = '-'}){

    if(!datum){
        return prikazDatuma
    }

    const d = new Date(datum)

    if(isNaN(d.getTime())){

        return prikazDatuma
    }

    return Intl.DateTimeFormat('hr-HR',{
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(d)
}