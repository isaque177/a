package com.bancoimagens.service;

import com.bancoimagens.model.ImagemModel;
import com.bancoimagens.Repository.Imagens_Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ImagemService {
    
    @Autowired
    private Imagens_Repository imagemRepository;
    
    // Listar todas as imagens
    public List<ImagemModel> listarTodas() {
        return imagemRepository.findAll();
    }
    

    // Salvar nova imagem
    public ImagemModel salvar(ImagemModel imagem) {
        // Validações
        if (imagem.getNome() == null || imagem.getNome().trim().isEmpty()) {
            throw new IllegalArgumentException("Nome da imagem é obrigatório");
        }
        
        if (imagem.getUrl() == null || imagem.getUrl().trim().isEmpty()) {
            throw new IllegalArgumentException("URL da imagem é obrigatória");
        }
        
        // Verificar se a URL é válida (básico)
        if (!isValidUrl(imagem.getUrl())) {
            throw new IllegalArgumentException("URL da imagem é inválida");
        }
        
        return imagemRepository.save(imagem);
    }
    
    // Atualizar imagem existente
    public ImagemModel atualizar(Long id, ImagemModel imagemAtualizada) {
        Optional<ImagemModel> imagemExistente = imagemRepository.findById(id);
        
        if (imagemExistente.isPresent()) {
            ImagemModel imagem = imagemExistente.get();
            
            // Validações
            if (imagemAtualizada.getNome() != null && !imagemAtualizada.getNome().trim().isEmpty()) {
                imagem.setNome(imagemAtualizada.getNome());
            }
            
            if (imagemAtualizada.getUrl() != null && !imagemAtualizada.getUrl().trim().isEmpty()) {
                if (isValidUrl(imagemAtualizada.getUrl())) {
                    imagem.setUrl(imagemAtualizada.getUrl());
                } else {
                    throw new IllegalArgumentException("URL da imagem é inválida");
                }
            }
            
            return imagemRepository.save(imagem);
        } else {
            throw new RuntimeException("Imagem não encontrada com ID: " + id);
        }
    }
    
    // Deletar imagem
    public void deletar(Long id) {
        if (imagemRepository.existsById(id)) {
            imagemRepository.deleteById(id);
        } else {
            throw new RuntimeException("Imagem não encontrada com ID: " + id);
        }
    }
    
  
    // Validação básica de URL
    private boolean isValidUrl(String url) {
        return url.startsWith("http://") || url.startsWith("https://");
    }
}