import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary/config';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tipo = searchParams.get('tipo');
    
    if (!tipo) {
      return NextResponse.json({ error: 'Tipo requerido' }, { status: 400 });
    }

    // 🔧 FIX: Usar la misma lógica que upload
    const carpeta = tipo === 'responsable' ? 'responsable_conteos' : `${tipo}s`;
    
    // Buscar exactamente donde se guardan
    const searchPrefixes = [
      `firmas/${carpeta}`,  // ✅ Esta es la ruta correcta
      `firmas/${tipo}`,     // Fallback
      carpeta,              // Fallback
      tipo                  // Fallback
    ];

    let result = null;

    for (const prefix of searchPrefixes) {
      try {
        console.log('🔍 Buscando en:', prefix); // Debug
        const resources = await cloudinary.api.resources({
          type: 'upload',
          prefix: prefix,
          max_results: 500
        });
        
        if (resources.resources && resources.resources.length > 0) {
          console.log('✅ Encontrado en:', prefix, 'Cantidad:', resources.resources.length);
          result = resources;
          break;
        }
      } catch (e) {
        console.log('❌ No encontrado en:', prefix);
        continue;
      }
    }

    if (!result) {
      result = { resources: [] };
    }

    const firmas = (result.resources || []).map((resource: any) => {
      const nombreArchivo = resource.public_id.split('/').pop() || resource.public_id;
      
      const url = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${resource.public_id}`;
      
      return {
        publicId: resource.public_id,
        nombre: formatearNombre(nombreArchivo),
        url: url
      };
    });
    
    return NextResponse.json({ firmas });
  } catch (error: any) {
    console.error('Error en /api/cloudinary/list:', error);
    return NextResponse.json(
      { error: error.message || 'Error al listar firmas' },
      { status: 500 }
    );
  }
}

function formatearNombre(nombre: string): string {
  // Remover extensión si existe
  let nombreLimpio = nombre.replace(/\.[^/.]+$/, '');
  
  // Si está vacío, devolver el nombre original
  if (!nombreLimpio || nombreLimpio.trim() === '') {
    return nombre;
  }
  
  // Convertir a formato legible
  return nombreLimpio
    .split(/[_-]/)
    .map(word => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .filter(word => word.length > 0)
    .join(' ');
}
