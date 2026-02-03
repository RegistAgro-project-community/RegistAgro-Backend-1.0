import { prisma } from "../lib/prisma";

(
    async ()=>{
        try {
            const seedExisted = await prisma.company.findMany()
            
            if(seedExisted.length != 0){
                console.error("A seed não pode ser criada porque esses dados já existem")
                
            }else{
                try {
                    await prisma.company.createMany({
                        data: [
                            {
                                nif: "500012345",
                                name: "Fazenda Verde Luanda",
                                location: "Viana",
                                province: "Luanda",
                                municipality: "Viana",
                                phone: 923456001,
                                email: "verde.luanda1@email.com",
                            },
                            {
                                nif: "500012378",
                                name: "Agro Sol do Kikuxi",
                                location: "Kikuxi",
                                province: "Luanda",
                                municipality: "Viana",
                                phone: 923098702,
                                email: "agrosol2@email.com",
                            },
                            {
                                nif: "500012398",
                                name: "Fazenda Boa Colheita",
                                location: "Talatona",
                                province: "Luanda",
                                municipality: "Talatona",
                                phone: 923005673,
                                email: "boacolheita3@email.com",
                            },
                            {
                                nif: "500098765",
                                name: "Agro Campo Fértil",
                                location: "Cacuaco",
                                province: "Luanda",
                                municipality: "Cacuaco",
                                phone: 923001204,
                                email: "campofertil4@email.com",
                            },
                            {
                                nif: "500012343",
                                name: "Fazenda Esperança",
                                location: "Sequele",
                                province: "Bengo",
                                municipality: "Cacuaco",
                                phone: 923000005,
                                email: "esperanca5@email.com",
                            },
                            {
                                nif: "500034567",
                                name: "Fazenda Terra Nova",
                                location: "Caxito",
                                province: "Bengo",
                                municipality: "Dande",
                                phone: 924003206,
                                email: "terranova6@email.com",
                            },
                            {
                                nif: "500009876",
                                name: "Agro Vale do Dande",
                                location: "Dande",
                                province: "Bengo",
                                municipality: "Dande",
                                phone: 924067007,
                                email: "valedodande7@email.com",
                            },
                            {
                                nif: "500089076",
                                name: "Fazenda Kifangondo Verde",
                                location: "Kifangondo",
                                province: "Bengo",
                                municipality: "Dande",
                                phone: 924090108,
                                email: "kifangondo8@email.com",
                            },
                            {
                                nif: "500090876",
                                name: "Agro Bengo Sul",
                                location: "Pango Aluquém",
                                province: "Bengo",
                                municipality: "Dembos",
                                phone: 924123009,
                                email: "bengosul9@email.com",
                            },
                            {
                                nif: "500010987",
                                name: "Fazenda Colheita Rica",
                                location: "Úcua",
                                province: "Bengo",
                                municipality: "Úcua",
                                phone: 924309810,
                                email: "colheitarica10@email.com",
                            },
                            {
                                nif: "500011109",
                                name: "Fazenda Agro Dande",
                                location: "Zona Agrícola do Dande",
                                province: "Bengo",
                                municipality: "Dande",
                                phone: 924110011,
                                email: "contacto@agrodande.co.ao",
                            },
                            {
                                nif: "500012111",
                                name: "Fazenda Boa Colheita do Úcua",
                                location: "Úcua Centro",
                                province: "Bengo",
                                municipality: "Úcua",
                                phone: 924110012,
                                email: "geral@boacolheitaucua.co.ao",
                            },
                            {
                                nif: "500013121",
                                name: "Agropecuária Terra Viva",
                                location: "Km 35 Estrada de Caxito",
                                province: "Bengo",
                                municipality: "Dande",
                                phone: 924110013,
                                email: "admin@terraviva.co.ao",
                            },
                            {
                                nif: "500014131",
                                name: "Fazenda Vale do Zenza",
                                location: "Margem do Rio Zenza",
                                province: "Bengo",
                                municipality: "Dembos",
                                phone: 924110014,
                                email: "valezenza@agro.co.ao",
                            },
                            {
                                nif: "500015141",
                                name: "Agro Fazenda Muxima Verde",
                                location: "Zona do Panguila",
                                province: "Bengo",
                                municipality: "Pango Aluquém",
                                phone: 924110015,
                                email: "muximaverde@gmail.com",
                            },
                            {
                                nif: "500016154",
                                name: "Fazenda Kikuxi Agrícola",
                                location: "Vale do Kikuxi",
                                province: "Luanda",
                                municipality: "Viana",
                                phone: 923210016,
                                email: "kikuxi.agro@gmail.com",
                            },
                            {
                                nif: "500017165",
                                name: "Agro Fazenda Quiminha",
                                location: "Zona da Quiminha",
                                province: "Luanda",
                                municipality: "Icolo e Bengo",
                                phone: 923210017,
                                email: "contacto@quiminhaagro.co.ao",
                            },
                            {
                                nif: "500018176",
                                name: "Fazenda Campo Verde de Calumbo",
                                location: "Calumbo Rural",
                                province: "Luanda",
                                municipality: "Calumbo",
                                phone: 923210018,
                                email: "campoverde.calumbo@email.com",
                            },
                            {
                                nif: "500019187",
                                name: "Agropecuária Boa Terra",
                                location: "Estrada do Catete",
                                province: "Luanda",
                                municipality: "Catete",
                                phone: 923210019,
                                email: "boaterra@agroangola.co.ao",
                            },
                            {
                                nif: "500020198",
                                name: "Fazenda Agro Mayombe",
                                location: "Zona Verde do Sequele",
                                province: "Luanda",
                                municipality: "Cacuaco",
                                phone: 923210020,
                                email: "agromayombe@gmail.com",
                            },
                
                            {
                                nif: "500021202",
                                name: "Agro Fazenda Kiala",
                                location: "Km 28 Estrada Nacional",
                                province: "Luanda",
                                municipality: "Viana",
                                phone: 923210021,
                                email: "kiala.agro@outlook.com",
                            },
                            {
                                nif: "500022213",
                                name: "Fazenda Sol Nascente",
                                location: "Zona Agrícola do Zango",
                                province: "Luanda",
                                municipality: "Viana",
                                phone: 923210022,
                                email: "solnascente.agro@gmail.com",
                            },
                            {
                                nif: "500023224",
                                name: "Agro Produção do Catete",
                                location: "Catete Centro Rural",
                                province: "Luanda",
                                municipality: "Catete",
                                phone: 923210023,
                                email: "catete.producao@agro.co.ao",
                            },
                            {
                                nif: "500024235",
                                name: "Fazenda Terra Fértil do Bengo",
                                location: "Margem do Rio Dande",
                                province: "Bengo",
                                municipality: "Dande",
                                phone: 924110024,
                                email: "terrafertil.bengo@gmail.com",
                            },
                            {
                                nif: "500025246",
                                name: "Agro Fazenda Horizonte Verde",
                                location: "Zona Agrícola da Barra do Dande",
                                province: "Bengo",
                                municipality: "Dande",
                                phone: 924110025,
                                email: "horizonteverde@agro.co.ao",
                            },
                
                            {
                                nif: "500026257",
                                name: "Fazenda Sementes do Futuro",
                                location: "Área Rural do Úcua",
                                province: "Bengo",
                                municipality: "Úcua",
                                phone: 924110026,
                                email: "sementesfuturo@gmail.com",
                            },
                            {
                                nif: "500027268",
                                name: "Agro Campo Seguro",
                                location: "Zona do Panguila",
                                province: "Bengo",
                                municipality: "Pango Aluquém",
                                phone: 924110027,
                                email: "camposeguro@outlook.com",
                            },
                            {
                                nif: "500028279",
                                name: "Fazenda Nova Colheita",
                                location: "Estrada Nacional Caxito",
                                province: "Bengo",
                                municipality: "Dande",
                                phone: 924110028,
                                email: "novacolheita@agro.co.ao",
                            },
                            {
                                nif: "500029280",
                                name: "Agro Fazenda Boa Safra",
                                location: "Zona Agrícola do Zenza",
                                province: "Bengo",
                                municipality: "Dembos",
                                phone: 924110029,
                                email: "boasafra@gmail.com",
                            },
                            {
                                nif: "500030298",
                                name: "Fazenda Produção Sustentável",
                                location: "Perímetro Agrícola do Zango",
                                province: "Luanda",
                                municipality: "Viana",
                                phone: 923210030,
                                email: "sustentavel@agroangola.co.ao",
                            }
                        ]
                    })
                
                    console.log("Seed criada com sucesso")
                    
                } catch (error) {
                    console.error("Não foi possível criar a seed")
                }   
            }

            await prisma.$disconnect()
        } catch (error) {
            console.error("Não foi possível verificar seed")
        }
    }
)()
