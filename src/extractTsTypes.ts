import { TypeLiteralNode, SourceFile, SyntaxKind, TypeElementTypes, ts, ArrayTypeNode, UnionTypeNode, LiteralTypeNode, InterfaceDeclaration } from "ts-morph";
import { FlatType, FlatTypesRegistry } from './runtime/nuxtMockerTypes'

export default async () => {
  const sourceFiles = await getTsSourceFiles()

  const flatTypes = sourceFiles.reduce(
    (tsTypes: FlatTypesRegistry, sourceFile) => {
      if ([ 'module', 'htmlTagInjectionTypes', 'mockableTypes', 'nuxtMockerTypes' ].includes(sourceFile.getBaseNameWithoutExtension())) {

        return tsTypes
      }
      return {
        ...tsTypes,
        ...extractInterfaces(sourceFile),
        ...extractTypeAliases(sourceFile),
      };
    },
    {}
  )

  return compileExtends(flatTypes)
};

const getTsSourceFiles = async () => {
  const { Project } = await import("ts-morph")

  return new Project({
    tsConfigFilePath: "tsconfig.json",
    compilerOptions: {
      lib: ["DOM", "ESNext"],
      allowJs: false,
      strictNullChecks: true,
    },
  }).getSourceFiles();
};

const getExtends = (interfaceItem: InterfaceDeclaration): Record<string, string[]> => {
  if (interfaceItem.getHeritageClauses().length > 0) {
    const clause = interfaceItem.getHeritageClauses()[0]

    return {
      extends: clause.getTypeNodes().map((typeNode) => typeNode.getText())
    }
  }

  return {}
}

const compileExtends = (flatTypes: FlatTypesRegistry): FlatTypesRegistry => Object.keys(flatTypes).reduce(
  (compiledFlatTypes: FlatTypesRegistry, typeName: string) => {
    if (flatTypes[typeName]?.extends && flatTypes[typeName]?.object) {
      return {
        ...compiledFlatTypes,
        [typeName]: getExtendedType(typeName, flatTypes)
      }
    }

    return compiledFlatTypes
  }, 
  flatTypes
)

const getExtendedType = (typeName: string, flatTypes: FlatTypesRegistry): FlatType => {
  return (flatTypes[typeName].extends || []).reduce(
    (compiledFlatType: FlatType, extendName: string) => {
      if (flatTypes[extendName]?.object) {
        const extendableFlatType = flatTypes[extendName]
        const extendableProps = extendableFlatType.extends ? getExtendedType(extendName, flatTypes).object : flatTypes[extendName].object

        return {
          ...compiledFlatType,
          object: {
            ...extendableProps,
            ...compiledFlatType.object
          }
        }
      }

      return compiledFlatType
    }, 
    flatTypes[typeName]
  )
}

const extractInterfaces = (sourceFile: SourceFile) =>
  sourceFile.getInterfaces().reduce((sourceFileInterfaces, interfaceItem) => {
    if (interfaceItem.getMembers().length > 0 || interfaceItem.getHeritageClauses().length > 0) {
      return {
        ...sourceFileInterfaces,
        [interfaceItem.compilerNode.name.getText()]: {
          ...getExtends(interfaceItem),
          object: interfaceItem.getMembers().reduce(
            extractMembers,
            {}
          ),
          isCollection: false,
          isNullable: false,
        },
      };
    }

    return sourceFileInterfaces;
  }, 
  {}
);

const extractTypeAliases = (sourceFile: SourceFile) =>
  sourceFile.getTypeAliases().reduce((sourceFileTypeAliases, typeAlias) => {
    const typeNode = typeAlias.getTypeNode()
    if (typeNode?.getKindName() === 'TypeLiteral') {

      return {
        ...sourceFileTypeAliases,
        [typeAlias.getName()]: {
          object: (typeNode as TypeLiteralNode).getMembers().reduce(
            extractMembers,
            {}
          ),
          isCollection: false,
          isNullable: false,
        }
      };
    }

    if (typeNode?.getKindName() === 'ArrayType') {
      return {
        ...sourceFileTypeAliases,
        [typeAlias.getName()]: {
          typeName: (typeNode as ArrayTypeNode).getElementTypeNode().getText(),
          isCollection: true,
          isNullabe: (typeNode as ArrayTypeNode).getType().isNullable()
        }
      }
    }

    if (typeNode?.getKindName() === 'UnionType') {
      return {
        ...sourceFileTypeAliases,
        [typeAlias.getName()]: {
          union: (typeNode as UnionTypeNode).getTypeNodes().map((typeNode) => {
            if (typeNode.getKindName() === 'LiteralType') {
              return {
                literal: (typeNode as LiteralTypeNode).getText(),
                isNullable: false,
                isCollection: false,
              }
            }
            if (typeNode.getKindName() === 'TypeReference') {
              const isCollection = typeNode.getKindName() === 'ArrayType'

              return {
                typeName: isCollection ? typeNode.getText().slice(0,-2) : typeNode.getText(),
                isNullable: false,
                isCollection
              }
            }
          })
        }
      }
    }

    return sourceFileTypeAliases
  }, 
  {}
);

const extractMembers = (members: FlatTypesRegistry | {}, member: TypeElementTypes) => {
  const memberType = member.getType()
  const memberSymbol = member.getSymbol()
  
  if (memberSymbol) {
    // Array
    if (member.compilerNode.type?.kind === SyntaxKind.ArrayType) {
      return {
        ...members,
        [memberSymbol.getName()]: {
          typeName: (member.compilerNode.type as ts.ArrayTypeNode).elementType.getText(),
          isNullable: memberType.isNullable(),
          isCollection: true
        },
      }
    }
    // Tuple
    if (memberType.isTuple()) {
      const tuple =  (member.compilerNode.type as ts.TupleTypeNode).elements.map(
        element => {
          const isCollection = element.kind === SyntaxKind.ArrayType
          
          return {
            typeName: isCollection ? element.getText().slice(0,-2) : element.getText(),
            isNullable: false,
            isCollection
          }
        }
      )
  
      return {
        ...members,
        [memberSymbol.getName()]: {
          tuple,
          isNullable: member.getType().isNullable(),
          isCollection: false,
        },
      }
    }

    // Union
    if (member.compilerNode.type?.kind === SyntaxKind.UnionType) {
      const union = (member.compilerNode.type as ts.UnionTypeNode).types.map(
        type => {
          if (type.kind === SyntaxKind.LiteralType) {
            
            return {
              literal: getLiteralValue(type as ts.LiteralTypeNode),
              isNullable: false,
              isCollection: false,
            }
          }
          const isCollection = type.kind === SyntaxKind.ArrayType
          return {
            typeName: isCollection ? type.getText().slice(0,-2) : type.getText(),
            isNullable: false,
            isCollection
          }
        }
      )

      return {
        ...members,
        [memberSymbol.getName()]: {
          union,
          isNullable: memberType.isNullable(),
          isCollection: false
        } 
      }
    }

    // Object
    if (memberType.isObject()) {
      const subType = member.getChildrenOfKind(SyntaxKind.TypeLiteral)[0]
      if (subType) {
        const object: FlatTypesRegistry = subType.getChildrenOfKind(SyntaxKind.PropertySignature).reduce(
          extractMembers,
          {}
        )

        return {
          ...members,
          [memberSymbol.getName()]: {
            object,
            isNullable: member.getType().isNullable(),
            isCollection: false
          },
        }
      }
    }

    // Literal
    if (memberType.isLiteral()) {
      
      return {
        ...members,
        [memberSymbol.getName()]: {
          literal: getLiteralValue(member.compilerNode.type as ts.LiteralTypeNode),
          isNullable: false,
          isCollection: false,
        }
      }
    }

    // @todo: should implement Record<>

    // Simple
    return {
      ...members,
      [memberSymbol.getName()]: {
        typeName: member.compilerNode.type?.getText(),
        isNullable: memberType.isNullable(),
        isCollection: false
      },
    }
  }
  
  return members
}

const getLiteralValue = (type: ts.LiteralTypeNode) => {
  switch(true) {
    case type.literal.kind === SyntaxKind.StringLiteral:
      return type.literal.getText().slice(1,-1)
    case type.literal.kind === SyntaxKind.TrueKeyword:
      return true
    case type.literal.kind === SyntaxKind.FalseKeyword:
      return false
    case type.literal.kind === SyntaxKind.NumericLiteral:
      return parseFloat(type.literal.getText())
    default:
      return undefined
  }
}