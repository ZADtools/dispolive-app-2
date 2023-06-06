require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name = 'W4bRcr1010'
  s.version = package['version']
  s.summary = package['description']
  s.license = package['license']
  s.homepage = package['repository']['url']
  s.author = package['author']
  s.source = { :git => package['repository']['url'], :tag => s.version.to_s }
  s.source_files = 'ios/Plugin/**/*.{swift,h,m,c,cc,mm,cpp}'
  s.ios.deployment_target  = '12.1'
  s.dependency 'Capacitor'
  s.dependency 'AEXML', '4.3.3'
  s.dependency 'CryptoSwift', '0.15.0'
  s.dependency 'GzipSwift', '4.1.0'
  s.swift_version = '5.1'
end
