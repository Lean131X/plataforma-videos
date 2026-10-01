import uuid
import boto3

from config import AWS_REGION

# no se pasan claves: en la EC2 boto3 usa los permisos del IAM Role
s3 = boto3.client("s3", region_name=AWS_REGION)


def subir_archivo(archivo, bucket: str, extension: str, tipo: str) -> str:
    # nombre unico para que no se pisen archivos con el mismo nombre
    clave = str(uuid.uuid4()) + "." + extension
    s3.upload_fileobj(archivo, bucket, clave, ExtraArgs={"ContentType": tipo})
    return "https://" + bucket + ".s3.amazonaws.com/" + clave


def eliminar_archivo(url: str, bucket: str):
    # la clave es lo ultimo de la url
    clave = url.split("/")[-1]
    s3.delete_object(Bucket=bucket, Key=clave)
