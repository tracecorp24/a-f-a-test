# ADR 0002: Native pipeline tek kullanıcı karşılaştırma politikası

## Durum
Accepted

## Bağlam
Framework karşılaştırmaları yapay soyutlamalar veya tek bir ortak sarmalayıcı ile yapılırsa her framework'ün gerçek gücü ve native paradigmaları kaybolur.

## Karar
Her framework kendi doğal tasarım primitive'leri (StateGraph, Agent, Crew/Task, Graph/Workflow vb.) ile bağımsız olarak inşa edilir. Ortak paydada yapay bir sarmalayıcı katman yazılmaz; yarışma native kodlar arasında gerçekleşir.

## Sonuçlar
- **Olumlu:** Adil ve gerçekçi kıyaslama; framework üreticilerinin tavsiye ettiği en iyi pratikler test edilir.
- **Olumsuz:** Her framework için uzman prompt ve kod üretim kuralları ayrı yazılmalıdır.
