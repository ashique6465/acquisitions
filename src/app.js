import exress from 'express';

const app = exress();

app.get('/', (req,res) =>{
    res.status(200).send('Hellow from Acquisitions!')
})

export default app;