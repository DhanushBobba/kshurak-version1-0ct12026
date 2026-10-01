from fastapi import (
    APIRouter,
    HTTPException
)

from fastapi.concurrency import run_in_threadpool

from pydantic import BaseModel

from app.services.gemini_face import analyze_face



router = APIRouter(

    prefix="/api/v1",

    tags=["Face"]

)



class FaceAnalysisRequest(BaseModel):

    front:str

    left:str

    right:str





@router.post("/face/analyze")

async def face_analysis(

    data:FaceAnalysisRequest

):

    try:


        if not data.front or not data.left or not data.right:

            raise HTTPException(

                status_code=400,

                detail="Three images required"

            )



        if len(data.front)<1000:

            raise HTTPException(

                status_code=400,

                detail="Front image data is invalid"

            )



        if len(data.left)<1000:

            raise HTTPException(

                status_code=400,

                detail="Left image data is invalid"

            )



        if len(data.right)<1000:

            raise HTTPException(

                status_code=400,

                detail="Right image data is invalid"

            )



        result = await run_in_threadpool(

            analyze_face,

            data.front,

            data.left,

            data.right

        )



        return result



    except HTTPException as error:

        raise error



    except Exception as error:


        print(

            "FACE ANALYSIS ERROR:",

            error

        )


        raise HTTPException(

            status_code=500,

            detail=str(error)

        )