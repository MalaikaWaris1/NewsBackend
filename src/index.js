import { app } from "./app.js";



    ;(async () => {
        const PORT=process.env.PORT||5000;
        try {
            app.listen(process.env.PORT, () => {
                console.log(`App is running on http://localhost:${PORT}`);
            })
        }
        catch (error) {
          console.log("Error:",error);
          throw error
        }
    })();
