package com.bancoimagens.Controller;

import com.bancoimagens.model.ImagemModel;
import com.bancoimagens.service.ImagemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/imagens")
@CrossOrigin(origins = "*")
public class ImagemController {

    @Autowired
    private ImagemService imagemService;

    // GET /api/imagens - Listar todas as imagens
    @GetMapping
    public ResponseEntity<List<ImagemModel>> listarTodas() {
        try {
            List<ImagemModel> imagens = imagemService.listarTodas();
            return ResponseEntity.ok(imagens);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // GET /api/imagens/{id} - Buscar imagem por ID
    @GetMapping("/{id}")
    public ResponseEntity<ImagemModel> buscarPorId(@PathVariable Long id) {
        try {
            Optional<ImagemModel> imagem = imagemService.buscarPorId(id);
            if (imagem.isPresent()) {
                return ResponseEntity.ok(imagem.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // POST /api/imagens - Adicionar nova imagem
    @PostMapping
    public ResponseEntity<ImagemModel> adicionarImagem(@RequestBody ImagemModel imagem) {
        try {
            ImagemModel imagemSalva = imagemService.salvar(imagem);
            return ResponseEntity.status(HttpStatus.CREATED).body(imagemSalva);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // PUT /api/imagens/{id} - Atualizar imagem
    @PutMapping("/{id}")
    public ResponseEntity<ImagemModel> atualizarImagem(@PathVariable Long id, @RequestBody ImagemModel imagem) {
        try {
            ImagemModel imagemAtualizada = imagemService.atualizar(id, imagem);
            return ResponseEntity.ok(imagemAtualizada);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // DELETE /api/imagens/{id} - Remover imagem
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerImagem(@PathVariable Long id) {
        try {
            imagemService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}