import express from "express";
import { PrismaClient } from '@prisma/client'
import { convertHourStringToMinutes } from "./utils/convert-hour-string-to-minutes";
import { convertMinuteToHourString } from "./utils/convert-minute-string-to-hour-string";
import cors from 'cors';

const app = express();
app.use(express.json()); //Prepara a rota para receber JSON
app.use(cors()) // Habilita qualquer URL fazer requisição para nosso back-end

const prisma = new PrismaClient()

app.get('/games', async (req, res) => {
  const games = await prisma.game.findMany({
    include:{
      _count:{
        select:{
          ads: true,
        }
      }
    }
  })
  return res.json(games);
})

app.post('/games/:id/ads', async (req, res) => {
  const gameId = req.params.id;
  const body = req.body;
  const ad = await prisma.ad.create({
    data:{
      gameId,
      name: body.name,
      yearsPlaying: body.yearsPlaying,
      discord: body.discord,
      weekDays: body.weekDays.join(','),
      hoursStart: convertHourStringToMinutes(body.hoursStart),
      hoursEnd: convertHourStringToMinutes(body.hoursEnd),
      useVoiceChannel: body.useVoiceChannel,
    }
  })

  return res.json(ad);
})

app.get("/games/:id/ads", async (req, res) => {
  const gameId : any = req.params.id;
  const ads = await prisma.ad.findMany({
    select:{
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hoursStart: true,
      hoursEnd: true,
    },
    where:{
      gameId: gameId,
    },
    orderBy:{
      createAt: 'desc',
    }
  })
  return res.json( ads.map( ad => {
    return {
      ...ad,
      weekDays: ad.weekDays.split(','),
      hoursStart: convertMinuteToHourString(ad.hoursStart),
      hoursEnd: convertMinuteToHourString(ad.hoursEnd),
    }
  }));
});

app.get("/ads/:id/discord", async (req, res) => {
  const adId = req.params.id;
  const ad = await prisma.ad.findUniqueOrThrow({
    select:{
      discord: true,
    },
    where:{
      id: adId,
    }
  })

  return res.json({
    discord: ad.discord
  });
});

app.listen(3333);
